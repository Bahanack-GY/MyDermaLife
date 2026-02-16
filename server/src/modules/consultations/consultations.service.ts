import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';
import { Consultation, ConsultationStatus, TranscriptionStatus } from './entities/consultation.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { SignalingGateway } from '../signaling/signaling.gateway';

@Injectable()
export class ConsultationsService {
    private readonly logger = new Logger(ConsultationsService.name);
    private openai: OpenAI | null = null;

    constructor(
        @InjectModel(Consultation)
        private consultationModel: typeof Consultation,
        @InjectModel(Doctor)
        private doctorModel: typeof Doctor,
        private signalingGateway: SignalingGateway,
        private configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
            this.logger.log('OpenAI Whisper API configured as primary transcription');
        } else {
            this.logger.log('No OPENAI_API_KEY set — using local Whisper only');
        }
    }
    // ... existing methods ...

    // ... inside completeConsultation ...
    async completeConsultation(id: string, doctorId: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, doctorId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found or does not belong to this doctor');
        }

        if (consultation.status === ConsultationStatus.COMPLETED) {
            return consultation;
        }

        consultation.status = ConsultationStatus.COMPLETED;
        consultation.actualEndTime = new Date();

        await consultation.save();

        // Notify room participants that the consultation has ended
        this.signalingGateway.server.to(id).emit('consultation-ended');

        // Update stats
        await this.updateDoctorStats(doctorId);

        return consultation;
    }

    async create(data: {
        patientId: string;
        doctorId: string;
        consultationType: any;
        scheduledDate: Date;
        chiefComplaint?: string;
    }): Promise<Consultation> {
        const doctor = await this.doctorModel.findByPk(data.doctorId);
        if (!doctor) {
            throw new NotFoundException('Doctor not found');
        }

        // Check for double booking
        // 1 Doctor, 1 Patient, 1 Schedule rule
        // We check if there is ANY existing consultation for this doctor at this exact time (or overlapping if duration was considered, but exact time is the current model)
        const overlapping = await this.consultationModel.findOne({
            where: {
                doctorId: data.doctorId,
                scheduledDate: data.scheduledDate,
                status: {
                    [Op.notIn]: [
                        ConsultationStatus.CANCELLED,
                        ConsultationStatus.REJECTED,
                        ConsultationStatus.NO_SHOW
                    ]
                }
            }
        });

        if (overlapping) {
            throw new ConflictException('This time slot is already booked.');
        }

        const fee = data.consultationType === 'video'
            ? (doctor.videoConsultationFee || doctor.consultationFee)
            : doctor.consultationFee;

        const consultationNumber = `CNS-${Math.floor(100000 + Math.random() * 900000)}`;

        return this.consultationModel.create({
            ...data,
            consultationNumber,
            fee,
            status: ConsultationStatus.SCHEDULED,
        } as any);
    }

    async findAll(doctorId: string): Promise<Consultation[]> {
        return this.consultationModel.findAll({
            where: { doctorId },
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [UserProfile],
                },
            ],
            order: [['scheduledDate', 'DESC']],
        });
    }

    async findOne(id: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [UserProfile],
                },
                {
                    model: Doctor,
                    include: [
                        { model: User, as: 'user', include: [UserProfile] }
                    ]
                }
            ],
        });

        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }

        return consultation;
    }

    async getStats(doctorId: string, queryStartDate?: string, queryEndDate?: string) {
        const now = new Date();
        let startOfDay: Date;
        let endOfDay: Date;
        let previousStart: Date;
        let previousEnd: Date;

        if (queryStartDate && queryEndDate) {
            startOfDay = new Date(queryStartDate);
            startOfDay.setHours(0, 0, 0, 0);

            endOfDay = new Date(queryEndDate);
            endOfDay.setHours(23, 59, 59, 999);

            const durationMs = endOfDay.getTime() - startOfDay.getTime();
            previousEnd = new Date(startOfDay.getTime() - 1);
            previousStart = new Date(previousEnd.getTime() - durationMs);
        } else {
            startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);

            previousStart = new Date(startOfDay);
            previousStart.setDate(previousStart.getDate() - 1);
            previousEnd = new Date(endOfDay);
            previousEnd.setDate(previousEnd.getDate() - 1);
        }

        // 1. Appointments in Period
        const appointmentsInPeriod = await this.consultationModel.count({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay,
                },
            }
        });

        const previousAppointments = await this.consultationModel.count({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: previousStart,
                    [Op.lte]: previousEnd,
                },
            }
        });

        const appointmentsChange = previousAppointments === 0
            ? (appointmentsInPeriod > 0 ? 100 : 0)
            : Math.round(((appointmentsInPeriod - previousAppointments) / previousAppointments) * 100);


        // 2. Active Patients in Period
        const patientsInPeriod = await this.consultationModel.count({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay,
                },
            },
            distinct: true,
            col: 'patientId',
        });

        const previousPatientsInPeriod = await this.consultationModel.count({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: previousStart,
                    [Op.lte]: previousEnd,
                }
            },
            distinct: true,
            col: 'patientId',
        });

        const patientsChange = previousPatientsInPeriod === 0
            ? (patientsInPeriod > 0 ? 100 : 0)
            : Math.round(((patientsInPeriod - previousPatientsInPeriod) / previousPatientsInPeriod) * 100);


        // 3. Completed Consultations in Period
        const completedConsultations = await this.consultationModel.count({
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                scheduledDate: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay,
                },
            }
        });

        const previousCompletedConsultations = await this.consultationModel.count({
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                scheduledDate: {
                    [Op.gte]: previousStart,
                    [Op.lte]: previousEnd,
                }
            }
        });

        const consultationsChange = previousCompletedConsultations === 0
            ? (completedConsultations > 0 ? 100 : 0)
            : Math.round(((completedConsultations - previousCompletedConsultations) / previousCompletedConsultations) * 100);


        // 4. Revenue in Period
        const revenueResult = await this.consultationModel.sum('fee', {
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                scheduledDate: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay,
                },
            }
        });
        const revenueInPeriod = revenueResult || 0;

        const previousRevenueResult = await this.consultationModel.sum('fee', {
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                scheduledDate: {
                    [Op.gte]: previousStart,
                    [Op.lte]: previousEnd,
                }
            }
        });
        const previousRevenue = previousRevenueResult || 0;

        const revenueChange = previousRevenue === 0
            ? (revenueInPeriod > 0 ? 100 : 0)
            : Math.round(((revenueInPeriod - previousRevenue) / previousRevenue) * 100);

        return {
            todaysAppointments: appointmentsInPeriod,
            totalPatients: patientsInPeriod,
            totalConsultations: completedConsultations,
            totalRevenue: revenueInPeriod,
            patientsChange,
            appointmentsChange,
            revenueChange,
            consultationsChange
        };
    }

    async getVisitsOverview(doctorId: string, queryStartDate?: string, queryEndDate?: string) {
        let startDate: Date;
        let endDate: Date;

        if (queryStartDate && queryEndDate) {
            startDate = new Date(queryStartDate);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(queryEndDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Default: Get visits for the last 7 days
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            startDate = new Date();
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
        }

        const consultations = await this.consultationModel.findAll({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            attributes: ['scheduledDate'],
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result: { name: string; patients: number }[] = [];

        // Loop through each day in the range
        // Safety check: if range is too large (e.g. > 60 days), maybe we should group by month?
        // For now, let's just stick to day-by-day as per requirements, assuming reasonable usage.

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayLabel = dayNames[d.getDay()]; // Or use full date specific logic if range > week?
            // If range is large, just "Mon", "Tue" repeats might be confusing. 
            // If range > 7 days, let's include date? e.g "Mon 12"

            let name = dayLabel;
            const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
            if (durationDays > 7) {
                name = `${dayLabel} ${d.getDate()}`;
            }

            const count = consultations.filter(c => {
                const cDate = new Date(c.scheduledDate);
                return cDate.getDate() === d.getDate() && cDate.getMonth() === d.getMonth() && cDate.getFullYear() === d.getFullYear();
            }).length;
            result.push({ name, patients: count });
        }

        return result;
    }

    async getUpcomingSchedule(doctorId: string) {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const consultations = await this.consultationModel.findAll({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: now,
                    [Op.lte]: tomorrow,
                },
                status: {
                    [Op.in]: [ConsultationStatus.SCHEDULED, ConsultationStatus.IN_PROGRESS]
                },
            },
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [UserProfile],
                }
            ],
            order: [['scheduledDate', 'ASC']],
            limit: 5,
        });

        return consultations.map(c => ({
            id: c.id,
            time: new Date(c.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            patient: c.patient?.profile ? `${c.patient.profile.firstName} ${c.patient.profile.lastName}` : c.patient?.email || 'Unknown',
            type: c.consultationType || 'Consultation',
            status: c.status,
        }));
    }


    async getPathologiesStats(doctorId: string) {
        // Group by diagnosis for completed consultations
        // Since we don't have a strict ontology yet, we'll try to group by the text field 'diagnosis' or 'chiefComplaint' if diagnosis is empty
        // For distinct count, we can use Sequelize's count with group
        // But for simplicity and to handle inconsistent text, let's fetch recent completed consultations and Aggregate in JS (for small dataset)
        // or use a raw query if performance is needed. Given MVP, let's fetch recent 1000 completed.

        const consultations = await this.consultationModel.findAll({
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                diagnosis: { [Op.ne]: null },
            },
            attributes: ['diagnosis'],
            limit: 1000,
        });

        const pathologyCounts: { [key: string]: number } = {};
        consultations.forEach(c => {
            if (c.diagnosis) {
                // simple normalization
                const diag = c.diagnosis.trim();
                pathologyCounts[diag] = (pathologyCounts[diag] || 0) + 1;
            }
        });

        // Convert to array and sort
        const sorted = Object.entries(pathologyCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Start with top 5

        // If empty, return something structure or empty list
        return sorted;
    }

    async getMonthlyRevenue(doctorId: string) {
        // Get revenue for the last 6 months
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const consultations = await this.consultationModel.findAll({
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                scheduledDate: {
                    [Op.gte]: sixMonthsAgo,
                },
            },
            attributes: ['scheduledDate', 'fee'],
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize map for the last 6 months
        const revenueMap = new Map<string, number>();
        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const monthName = months[d.getMonth()];
            revenueMap.set(monthName, 0);
        }

        consultations.forEach(c => {
            const d = new Date(c.scheduledDate);
            const monthName = months[d.getMonth()];
            if (c.fee) {
                const current = revenueMap.get(monthName) || 0;
                // Ensure fee is treated as number
                revenueMap.set(monthName, current + Number(c.fee));
            }
        });

        // Convert to array
        // We want to return in chronological order of the last 6 months
        const result: { name: string; amount: number }[] = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const monthName = months[d.getMonth()];
            result.push({
                name: monthName,
                amount: revenueMap.get(monthName) || 0
            });
        }

        return result;
    }

    async getDailyAppointments(doctorId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.consultationModel.findAll({
            where: {
                doctorId,
                scheduledDate: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay,
                },
                status: {
                    [Op.ne]: ConsultationStatus.CANCELLED
                }
            },
            include: [
                {
                    model: User,
                    as: 'patient',
                    include: [UserProfile],
                }
            ],
            order: [['scheduledDate', 'ASC']],
        });
    }

    async sendRecall(consultationId: string) {
        const consultation = await this.findOne(consultationId);

        // Mock notification logic
        console.log(`Sending recall notification to patient ${consultation.patientId} for consultation ${consultationId}`);

        return { success: true, message: 'Recall notification sent' };
    }

    async findAllForPatient(patientId: string): Promise<Consultation[]> {
        return this.consultationModel.findAll({
            where: { patientId },
            include: [
                {
                    model: Doctor,
                    include: [
                        { model: User, as: 'user', attributes: ['id', 'email'], include: [UserProfile] }
                    ]
                }
            ],
            order: [['scheduledDate', 'ASC']], // Upcoming first usually better
        });
    }

    async acceptConsultation(id: string, patientId: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, patientId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }
        if (consultation.status !== ConsultationStatus.PROPOSED) {
            // Alternatively allow re-confirming? For now strictly restrict to PROPOSED
            // throw new BadRequestException('Consultation is not in proposed status');
        }

        consultation.status = ConsultationStatus.SCHEDULED;
        return consultation.save();
    }

    async rejectConsultation(id: string, patientId: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, patientId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }

        consultation.status = ConsultationStatus.REJECTED;
        return consultation.save();
    }

    async joinWaitingRoom(id: string, patientId: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, patientId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }
        consultation.isPatientOnline = true;
        await consultation.save();
        this.signalingGateway.server.to(id).emit('patient-joined-waiting-room');
        return consultation;
    }

    async leaveWaitingRoom(id: string, patientId: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, patientId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }
        consultation.isPatientOnline = false;
        await consultation.save();
        this.signalingGateway.server.to(id).emit('patient-left-waiting-room');
        return consultation;
    }

    async finishConsultationByPatient(id: string, patientId: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, patientId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }

        if (consultation.status === ConsultationStatus.COMPLETED) {
            return consultation;
        }

        consultation.status = ConsultationStatus.COMPLETED;
        consultation.actualEndTime = new Date();
        await consultation.save();

        this.signalingGateway.server.to(id).emit('patient-finished-consultation');

        return consultation;
    }

    async rateConsultation(id: string, patientId: string, rating: number, review?: string): Promise<Consultation> {
        const consultation = await this.consultationModel.findOne({ where: { id, patientId } });
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }

        if (consultation.status !== ConsultationStatus.COMPLETED) {
            // Depending on flow, we might want to auto-complete it?
            // For now, assume it's completed or allow rating if it's 'scheduled' but 'ended'?
            // Let's enforce status check generally, but maybe relax it if the doctor forgot to mark complete?
            // Safer to just update.
        }

        consultation.rating = rating;
        consultation.review = review || '';
        // Auto-complete if rated?
        if (consultation.status !== ConsultationStatus.COMPLETED) {
            consultation.status = ConsultationStatus.COMPLETED;
            consultation.actualEndTime = new Date(); // Approximate
        }

        await consultation.save();

        // Update Doctor's stats
        await this.updateDoctorStats(consultation.doctorId);

        return consultation;
    }

    async saveRecording(consultationId: string, file: Express.Multer.File): Promise<Consultation> {
        const consultation = await this.consultationModel.findByPk(consultationId);
        if (!consultation) {
            throw new NotFoundException('Consultation not found');
        }

        const recordingUrl = `/uploads/recordings/${file.filename}`;
        consultation.videoRecordingUrl = recordingUrl;
        consultation.transcriptionStatus = TranscriptionStatus.PENDING;
        await consultation.save();

        // Trigger async transcription (fire-and-forget)
        this.transcribeRecording(consultationId, file.path).catch(err => {
            this.logger.error(`Transcription failed for consultation ${consultationId}: ${err.message}`);
        });

        return consultation;
    }

    private async transcribeRecording(consultationId: string, audioFilePath: string): Promise<void> {
        const consultation = await this.consultationModel.findByPk(consultationId, {
            include: [{
                model: Doctor,
                include: [{ model: User, as: 'user', include: [UserProfile] }],
            }],
        });
        if (!consultation) return;

        consultation.transcriptionStatus = TranscriptionStatus.PROCESSING;
        await consultation.save();

        const absoluteAudioPath = path.resolve(audioFilePath);
        let transcriptionText: string | null = null;

        // Step 1: Transcribe — try OpenAI API first, fall back to local Whisper
        if (this.openai) {
            try {
                this.logger.log(`[Transcription] Using OpenAI Whisper API for consultation ${consultationId}`);
                transcriptionText = await this.transcribeWithOpenAI(absoluteAudioPath);
                this.logger.log(`[Transcription] OpenAI API succeeded for consultation ${consultationId}`);
            } catch (err) {
                this.logger.warn(`OpenAI API transcription failed for ${consultationId}: ${err.message}. Falling back to local Whisper.`);
            }
        }

        if (!transcriptionText) {
            try {
                this.logger.log(`[Transcription] Using local Whisper (fallback) for consultation ${consultationId}`);
                transcriptionText = await this.transcribeWithLocalWhisper(absoluteAudioPath);
                this.logger.log(`[Transcription] Local Whisper succeeded for consultation ${consultationId}`);
            } catch (err) {
                this.logger.error(`Local Whisper transcription also failed for ${consultationId}: ${err.message}`);
                consultation.transcriptionStatus = TranscriptionStatus.FAILED;
                await consultation.save();
                return;
            }
        }

        // Save transcription
        consultation.transcription = transcriptionText;
        consultation.transcriptionStatus = TranscriptionStatus.COMPLETED;
        await consultation.save();

        // Step 2: Generate medical report from transcription via GPT
        if (this.openai && transcriptionText) {
            try {
                const doctorLang = consultation.doctor?.user?.profile?.language || 'fr';
                this.logger.log(`[Report] Generating medical report for consultation ${consultationId} in language: ${doctorLang}`);
                await this.generateMedicalReport(consultation, transcriptionText, doctorLang);
                this.logger.log(`[Report] Medical report generated for consultation ${consultationId}`);
            } catch (err) {
                this.logger.error(`[Report] Failed to generate medical report for ${consultationId}: ${err.message}`);
                // Non-fatal: transcription is saved even if report generation fails
            }
        }
    }

    private async transcribeWithOpenAI(audioFilePath: string): Promise<string> {
        const file = fs.createReadStream(audioFilePath);
        const response = await this.openai!.audio.transcriptions.create({
            file,
            model: 'whisper-1',
            language: 'fr',
        });
        return response.text;
    }

    private transcribeWithLocalWhisper(audioFilePath: string): Promise<string> {
        const scriptPath = path.join(process.cwd(), 'scripts', 'transcribe.py');
        const venvPython = path.join(process.cwd(), '.venv', 'bin', 'python3');

        return new Promise<string>((resolve, reject) => {
            const proc = spawn(venvPython, [scriptPath, audioFilePath], {
                timeout: 600000, // 10 min timeout
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => { stdout += data.toString(); });
            proc.stderr.on('data', (data) => { stderr += data.toString(); });

            proc.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Whisper exited with code ${code}: ${stderr}`));
                    return;
                }
                try {
                    const result = JSON.parse(stdout);
                    resolve(result.text);
                } catch (err) {
                    reject(new Error(`Failed to parse Whisper output: ${err.message}`));
                }
            });

            proc.on('error', (err) => {
                reject(new Error(`Failed to spawn Whisper: ${err.message}`));
            });
        });
    }

    private async generateMedicalReport(
        consultation: Consultation,
        transcription: string,
        language: string,
    ): Promise<void> {
        const langLabel = language === 'fr' ? 'French' : language === 'en' ? 'English' : language;

        const systemPrompt = `You are a medical report assistant for a dermatology practice.
Given a transcription of a doctor-patient consultation, extract and structure the information into a formal medical report.
Respond ONLY with valid JSON matching this exact schema:
{
  "diagnosis": "string or null",
  "treatmentPlan": "string or null",
  "notes": "string or null",
  "followUpRequired": boolean,
  "followUpDate": "YYYY-MM-DD or null"
}

Rules:
- Write the report in ${langLabel}.
- Only include fields where information was clearly discussed. Use null if not mentioned.
- "diagnosis" should contain the medical diagnosis or provisional diagnosis.
- "treatmentPlan" should contain prescribed treatments, medications, and care instructions.
- "notes" should contain relevant clinical observations, patient history mentioned, and any other important details.
- "followUpRequired" should be true if a follow-up was discussed.
- "followUpDate" should be the specific date if mentioned, otherwise null.
- Be concise but medically accurate. Use proper medical terminology.
- Do NOT invent information that was not in the transcription.`;

        const response = await this.openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Chief complaint: ${consultation.chiefComplaint || 'Not specified'}\n\nTranscription:\n${transcription}` },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return;

        const report = JSON.parse(content);

        // Only update fields that GPT extracted — don't overwrite existing doctor input
        if (report.diagnosis && !consultation.diagnosis) {
            consultation.diagnosis = report.diagnosis;
        }
        if (report.treatmentPlan && !consultation.treatmentPlan) {
            consultation.treatmentPlan = report.treatmentPlan;
        }
        if (report.notes && !consultation.notes) {
            consultation.notes = report.notes;
        }
        if (report.followUpRequired !== undefined) {
            consultation.followUpRequired = report.followUpRequired;
        }
        if (report.followUpDate && !consultation.followUpDate) {
            consultation.followUpDate = report.followUpDate;
        }

        await consultation.save();
    }

    async updateDoctorStats(doctorId: string) {
        // 1. Count completed video consultations
        const totalConsultations = await this.consultationModel.count({
            where: {
                doctorId,
                status: ConsultationStatus.COMPLETED,
                consultationType: 'video' // ConsultationType.VIDEO
            }
        });

        // 2. Average rating (from VIDEO consultations only)
        // We use a raw query or findOne with attributes for aggregation
        const ratingStats: any = await this.consultationModel.findOne({
            where: {
                doctorId,
                consultationType: 'video', // ConsultationType.VIDEO
                rating: { [Op.ne]: null }
            },
            attributes: [
                [this.consultationModel.sequelize!.fn('AVG', this.consultationModel.sequelize!.col('rating')), 'avgRating'],
                [this.consultationModel.sequelize!.fn('COUNT', this.consultationModel.sequelize!.col('rating')), 'countRating']
            ],
            raw: true,
        });

        const avgRating = ratingStats?.avgRating ? parseFloat(ratingStats.avgRating).toFixed(1) : 0;
        const totalReviews = ratingStats?.countRating ? parseInt(ratingStats.countRating) : 0;

        await this.doctorModel.update({
            totalConsultations,
            rating: Number(avgRating),
            totalReviews
        }, {
            where: { id: doctorId }
        });
    }
}
