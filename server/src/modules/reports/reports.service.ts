import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import OpenAI from 'openai';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import { Consultation, ConsultationStatus, ConsultationType } from '../consultations/entities/consultation.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

interface ReportsQuery {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);
    private openai: OpenAI | null = null;

    constructor(
        @InjectModel(Consultation)
        private consultationModel: typeof Consultation,
        private configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    async findAll(doctorId: string, query: ReportsQuery) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;

        const where: any = {
            doctorId,
            status: ConsultationStatus.COMPLETED,
        };

        // Filter by report status (maps to consultation properties)
        if (query.status === 'PendingReview') {
            // Completed but no diagnosis yet
            where.diagnosis = { [Op.or]: [null, ''] };
        } else if (query.status === 'Finalized') {
            // Completed with diagnosis
            where.diagnosis = { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] };
        }

        // Date range filter
        if (query.startDate) {
            where.scheduledDate = { ...where.scheduledDate, [Op.gte]: new Date(query.startDate) };
        }
        if (query.endDate) {
            where.scheduledDate = { ...where.scheduledDate, [Op.lte]: new Date(query.endDate) };
        }

        // Search filter
        const searchWhere = query.search
            ? {
                [Op.or]: [
                    { consultationNumber: { [Op.iLike]: `%${query.search}%` } },
                    { chiefComplaint: { [Op.iLike]: `%${query.search}%` } },
                    { diagnosis: { [Op.iLike]: `%${query.search}%` } },
                ],
            }
            : {};

        const { rows, count } = await this.consultationModel.findAndCountAll({
            where: { ...where, ...searchWhere },
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [UserProfile],
                },
            ],
            order: [['scheduledDate', 'DESC']],
            limit,
            offset,
        });

        return {
            data: rows.map(c => this.toReport(c)),
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    async findOne(id: string, doctorId: string) {
        const consultation = await this.consultationModel.findOne({
            where: { id, doctorId, status: ConsultationStatus.COMPLETED },
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [UserProfile],
                },
            ],
        });

        if (!consultation) return null;
        return this.toReport(consultation);
    }

    async generatePdf(id: string, doctorId: string): Promise<Buffer | null> {
        const consultation = await this.consultationModel.findOne({
            where: { id, doctorId, status: ConsultationStatus.COMPLETED },
            include: [
                { model: User, as: 'patient', include: [UserProfile] },
                { model: Doctor, include: [{ model: User, as: 'user', include: [UserProfile] }] },
            ],
        });

        if (!consultation) return null;

        const report = this.toReport(consultation);
        const doctorProfile = consultation.doctor?.user?.profile;
        const doctorName = doctorProfile
            ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
            : 'Dr.';
        const specialization = consultation.doctor?.specialization || 'Dermatologie';

        // Generate a medical report from the transcription using GPT-4o-mini
        let gptReport: { motif?: string; historique?: string; examenClinique?: string; diagnostic?: string; planTraitement?: string; recommandations?: string; suivi?: string } | null = null;
        if (report.transcription && this.openai) {
            const doctorLang = consultation.doctor?.user?.profile?.language || 'fr';
            gptReport = await this.generateReportFromTranscription(report, doctorLang);
        }

        return this.buildPdf(report, doctorName, specialization, gptReport);
    }

    private async generateReportFromTranscription(
        report: ReturnType<ReportsService['toReport']>,
        language: string,
    ) {
        const langLabel = language === 'fr' ? 'French' : language === 'en' ? 'English' : language;

        const systemPrompt = `You are a medical report writer for a dermatology practice.
Given the transcription of a doctor-patient teleconsultation, produce a professional, well-structured medical report.

Write the entire report in ${langLabel}.

Return a JSON object with these sections (omit any section that has no relevant information):
{
  "motif": "Reason for consultation / Chief complaint",
  "historique": "Patient medical history relevant to the consultation",
  "examenClinique": "Clinical examination findings discussed",
  "diagnostic": "Diagnosis or differential diagnoses",
  "planTraitement": "Treatment plan with medications, dosages, and instructions",
  "recommandations": "Lifestyle recommendations and patient advice",
  "suivi": "Follow-up plan with timeline"
}

Important:
- Use professional medical terminology appropriate for a dermatology report
- Be concise but thorough
- Each section should be a plain text string (no markdown)
- Only include sections that have actual content from the consultation`;

        const userContent = [
            report.chiefComplaint ? `Chief complaint: ${report.chiefComplaint}` : '',
            report.diagnosis ? `Existing diagnosis: ${report.diagnosis}` : '',
            report.treatmentPlan ? `Existing treatment plan: ${report.treatmentPlan}` : '',
            report.notes ? `Doctor notes: ${report.notes}` : '',
            `\nTranscription:\n${report.transcription}`,
        ].filter(Boolean).join('\n');

        try {
            this.logger.log(`[PDF Report] Generating medical report with GPT-4o-mini`);
            const response = await this.openai!.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent },
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) return null;

            const parsed = JSON.parse(content);
            this.logger.log(`[PDF Report] GPT report generated successfully`);
            return parsed;
        } catch (err) {
            this.logger.error(`[PDF Report] GPT report generation failed: ${err.message}`);
            return null;
        }
    }

    private buildPdf(
        report: ReturnType<ReportsService['toReport']>,
        doctorName: string,
        specialization: string,
        gptReport: any | null,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
            const chunks: Buffer[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Brand colors
            const brandDefault = '#d4a373';
            const brandDark = '#8d6e63';
            const brandText = '#4a403a';
            const brandLight = '#fefae0';
            const brandSoft = '#e9edc9';

            // --- HEADER ---
            doc.rect(0, 0, doc.page.width, 6).fill(brandDefault);
            doc.rect(0, 6, doc.page.width, 80).fill(brandLight);

            doc.fontSize(26).font('Helvetica-Bold').fillColor(brandDark)
                .text('DermaLife', 50, 24, { continued: false });
            doc.fontSize(10).font('Helvetica').fillColor(brandText)
                .text('Rapport de Consultation', 50, 54);

            doc.fontSize(9).font('Helvetica').fillColor(brandDark)
                .text(report.consultationId, 350, 30, { width: 200, align: 'right' });
            const dateStr = this.formatDate(report.consultationDate);
            doc.fontSize(9).fillColor(brandText)
                .text(dateStr, 350, 44, { width: 200, align: 'right' });
            const statusLabel = report.status === 'Finalized' ? 'Finalisé' : 'En attente de revue';
            doc.fontSize(9).fillColor(report.status === 'Finalized' ? '#2e7d32' : '#f57f17')
                .text(statusLabel, 350, 58, { width: 200, align: 'right' });

            let y = 100;

            // --- DOCTOR & PATIENT INFO ---
            doc.rect(50, y, 240, 70).lineWidth(0.5).strokeColor(brandSoft).fillAndStroke(brandLight, brandSoft);
            doc.fontSize(8).font('Helvetica-Bold').fillColor(brandDark).text('MÉDECIN', 60, y + 8);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(brandText).text(doctorName, 60, y + 22);
            doc.fontSize(9).font('Helvetica').fillColor(brandText).text(specialization, 60, y + 38);

            doc.rect(310, y, 240, 70).lineWidth(0.5).strokeColor(brandSoft).fillAndStroke(brandLight, brandSoft);
            doc.fontSize(8).font('Helvetica-Bold').fillColor(brandDark).text('PATIENT', 320, y + 8);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(brandText).text(report.patientName, 320, y + 22);
            doc.fontSize(9).font('Helvetica').fillColor(brandText).text(report.type, 320, y + 38);
            if (report.durationMinutes) {
                doc.text(`Durée: ${report.durationMinutes} min`, 320, y + 52);
            }

            y += 90;

            // --- REPORT SECTIONS ---
            const addSection = (title: string, content: string) => {
                if (!content) return;

                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }

                doc.rect(50, y, 4, 18).fill(brandDefault);
                doc.fontSize(12).font('Helvetica-Bold').fillColor(brandDark)
                    .text(title, 62, y + 2);
                y += 26;

                doc.fontSize(10).font('Helvetica').fillColor(brandText);
                const textHeight = doc.heightOfString(content, { width: 490 });

                if (y + textHeight > 750) {
                    doc.addPage();
                    y = 50;
                }

                doc.text(content, 55, y, { width: 490 });
                y += textHeight + 20;
            };

            // If GPT generated a report from the transcription, use those sections
            if (gptReport) {
                if (gptReport.motif) addSection('Motif de consultation', gptReport.motif);
                if (gptReport.historique) addSection('Historique médical', gptReport.historique);
                if (gptReport.examenClinique) addSection('Examen clinique', gptReport.examenClinique);
                if (gptReport.diagnostic) addSection('Diagnostic', gptReport.diagnostic);
                if (gptReport.planTraitement) addSection('Plan de traitement', gptReport.planTraitement);
                if (gptReport.recommandations) addSection('Recommandations', gptReport.recommandations);
                if (gptReport.suivi) addSection('Suivi', gptReport.suivi);
            } else {
                // Fallback: use the raw consultation fields
                if (report.chiefComplaint) addSection('Motif de consultation', report.chiefComplaint);
                if (report.diagnosis) addSection('Diagnostic', report.diagnosis);
                if (report.treatmentPlan) addSection('Plan de traitement', report.treatmentPlan);
                if (report.notes) addSection('Notes cliniques', report.notes);
            }

            // Follow-up section
            if (report.followUpRequired) {
                if (y > 700) { doc.addPage(); y = 50; }

                doc.rect(50, y, 500, 30).lineWidth(0.5).strokeColor('#f9a825').fillAndStroke('#fff8e1', '#f9a825');
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#f57f17')
                    .text('Suivi requis', 62, y + 8, { continued: !!report.followUpDate });
                if (report.followUpDate) {
                    doc.font('Helvetica').text(` — ${this.formatDate(report.followUpDate)}`);
                }
                y += 44;
            }

            // --- FOOTER on every page ---
            const pages = doc.bufferedPageRange();
            for (let i = pages.start; i < pages.start + pages.count; i++) {
                doc.switchToPage(i);
                const pageH = doc.page.height;

                doc.rect(50, pageH - 60, 500, 0.5).fill(brandSoft);
                doc.fontSize(8).font('Helvetica').fillColor(brandDark)
                    .text('Généré par DermaLife', 50, pageH - 48, { width: 500, align: 'center' });
                doc.fontSize(7).fillColor('#999999')
                    .text(`Page ${i + 1} sur ${pages.count}`, 50, pageH - 36, { width: 500, align: 'center' });
            }

            doc.end();
        });
    }

    private formatDate(date: any): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    private toReport(c: Consultation) {
        const profile = c.patient?.profile;
        const patientName = profile
            ? `${profile.firstName} ${profile.lastName}`
            : c.patient?.email || 'Unknown';

        const typeLabel = this.getTypeLabel(c.consultationType);
        const hasDiagnosis = c.diagnosis && c.diagnosis.trim().length > 0;

        return {
            id: c.id,
            consultationId: c.consultationNumber,
            patientId: c.patientId,
            patientName,
            doctorId: c.doctorId,
            type: typeLabel,
            title: c.chiefComplaint || c.diagnosis || c.consultationNumber,
            status: hasDiagnosis ? 'Finalized' : 'PendingReview',
            generatedAt: c.actualEndTime || c.updatedAt,
            consultationDate: c.scheduledDate,
            // Structured consultation data
            chiefComplaint: c.chiefComplaint || null,
            symptoms: c.symptoms || null,
            diagnosis: c.diagnosis || null,
            treatmentPlan: c.treatmentPlan || null,
            notes: c.notes || null,
            durationMinutes: c.durationMinutes || null,
            followUpRequired: c.followUpRequired,
            followUpDate: c.followUpDate || null,
            transcription: c.transcription || null,
            transcriptionStatus: c.transcriptionStatus,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        };
    }

    private getTypeLabel(type: ConsultationType): string {
        switch (type) {
            case ConsultationType.VIDEO: return 'Teleconsultation';
            case ConsultationType.CHAT: return 'Chat';
            case ConsultationType.IN_PERSON: return 'En cabinet';
            default: return 'Consultation';
        }
    }
}
