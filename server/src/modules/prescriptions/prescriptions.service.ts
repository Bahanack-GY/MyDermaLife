import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

@Injectable()
export class PrescriptionsService {
    constructor(
        @InjectModel(Prescription)
        private prescriptionModel: typeof Prescription,
    ) { }

    async create(doctorId: string, createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
        const prescription = await this.prescriptionModel.create({
            doctorId,
            ...createPrescriptionDto,
        });

        // Generate PDF
        const pdfUrl = await this.generatePdf(prescription.id);

        // Update with PDF URL
        await prescription.update({ pdfUrl });

        return prescription;
    }

    async generatePdf(prescriptionId: string): Promise<string> {
        const prescription = await this.prescriptionModel.findByPk(prescriptionId, {
            include: [
                {
                    model: Doctor,
                    include: [{ model: User, as: 'user', include: [UserProfile] }]
                },
                {
                    model: User,
                    include: [UserProfile]
                }
            ]
        });

        if (!prescription) {
            throw new Error('Prescription not found');
        }

        const doc = new PDFDocument({ margin: 50 });
        const fileName = `prescription-${prescription.id}.pdf`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'prescriptions');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        doc.pipe(fs.createWriteStream(filePath));

        // --- Colors ---
        const colors = {
            brandDefault: '#d4a373',
            brandLight: '#fefae0',
            brandDark: '#8d6e63',
            brandSoft: '#e9edc9',
            brandText: '#4a403a',
            brandMuted: '#9ca3af',
            brandBg: '#f9f9f9'
        };

        // --- Header ---
        // Doctor Name
        doc.fontSize(24)
            .font('Times-Bold') // Serif approximation
            .fillColor(colors.brandDark)
            .text(`Dr. ${prescription.doctor.user.profile.firstName} ${prescription.doctor.user.profile.lastName}`, 50, 50);

        // Doctor Subtitle
        doc.fontSize(10)
            .font('Helvetica')
            .fillColor(colors.brandMuted)
            .text('DERMATOLOGIST, MD', 50, 80)
            .text(`Lic: ${prescription.doctor.licenseNumber || '12345-678'}`, 50, 95);

        // Logo / Brand Name (Right aligned)
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor(colors.brandDefault)
            .text('MyDermaLife', 400, 50, { align: 'right' });

        doc.fontSize(8)
            .font('Helvetica')
            .fillColor(colors.brandMuted)
            .text('123 Rue de la Santé, Bonanjo', 400, 75, { align: 'right' })
            .text('Douala, Cameroun', 400, 85, { align: 'right' });

        // Divider
        doc.moveTo(50, 120)
            .lineTo(550, 120)
            .lineWidth(1)
            .strokeColor(colors.brandDefault)
            .stroke();

        // --- Patient Info Box ---
        const patientBoxTop = 140;
        doc.roundedRect(50, patientBoxTop, 500, 80, 10)
            .fill(colors.brandBg); // Background

        doc.fillColor(colors.brandText); // Reset text color

        // Patient Name
        doc.fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(colors.brandMuted)
            .text('PATIENT NAME', 70, patientBoxTop + 15);

        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor(colors.brandDark)
            .text(`${prescription.patient.profile.firstName} ${prescription.patient.profile.lastName}`, 70, patientBoxTop + 30);

        // Calculate Age
        let age = 'N/A';
        if (prescription.patient.profile.dateOfBirth) {
            const dob = new Date(prescription.patient.profile.dateOfBirth);
            const diffMs = Date.now() - dob.getTime();
            const ageDate = new Date(diffMs);
            age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
        }

        // Patient Details
        doc.fontSize(10)
            .font('Helvetica')
            .fillColor(colors.brandMuted)
            .text(`${age} years • ${prescription.patient.profile.gender || 'N/A'}`, 70, patientBoxTop + 50);

        // Date & Ref (Right aligned within box)
        doc.fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(colors.brandMuted)
            .text('DATE', 400, patientBoxTop + 15);

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .fillColor(colors.brandDark)
            .text(prescription.date ? new Date(prescription.date).toLocaleDateString() : new Date().toLocaleDateString(), 400, patientBoxTop + 30);

        doc.fontSize(10)
            .font('Helvetica')
            .fillColor(colors.brandMuted)



        // --- content ---
        let yPos = 250;

        // Diagnosis
        if (prescription.diagnosis) {
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor(colors.brandMuted)
                .text('DIAGNOSIS', 50, yPos);

            yPos += 15;

            doc.fontSize(12)
                .font('Helvetica')
                .fillColor(colors.brandText)
                .text(prescription.diagnosis, 50, yPos);

            yPos += 40;
        }

        // Rx Symbol
        doc.fontSize(36)
            .font('Times-BoldItalic')
            .fillColor(colors.brandDefault)
            .text('Rx', 50, yPos);

        yPos += 50;

        // Medications
        if (Array.isArray(prescription.medications)) {
            prescription.medications.forEach((med: any) => {
                // Border strip
                doc.rect(50, yPos, 4, 45)
                    .fill(colors.brandLight);

                // Medicine Name
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .fillColor(colors.brandDark)
                    .text(med.name || 'Medicine', 65, yPos);

                // Dosage
                doc.fontSize(12)
                    .font('Helvetica-Bold')
                    .fillColor(colors.brandText)
                    .text(med.dosage || '', 300, yPos, { align: 'right' }); // Right aligned dosage? or next to name

                yPos += 20;

                // Frequency & Duration
                doc.fontSize(10)
                    .font('Helvetica')
                    .fillColor(colors.brandMuted)
                    .text(`${med.frequency || 'N/A'}  •  ${med.duration || 'N/A'}`, 65, yPos);

                yPos += 15;

                // Instructions
                if (med.instructions) {
                    doc.fontSize(10)
                        .font('Helvetica-Oblique')
                        .fillColor(colors.brandMuted)
                        .text(`"${med.instructions}"`, 65, yPos);
                    yPos += 15;
                }

                yPos += 20; // Spacing between meds
            });
        }

        // --- Footer ---
        const bottomY = 700;

        // Address
        doc.fontSize(9)
            .font('Helvetica')
            .fillColor(colors.brandMuted)
            .text(`Dr. ${prescription.doctor.user.profile.firstName} ${prescription.doctor.user.profile.lastName}`, 50, bottomY)
            .text('Generated by MyDermaLife', 50, bottomY + 15);

        // Signature Line
        doc.moveTo(350, bottomY + 10)
            .lineTo(550, bottomY + 10)
            .lineWidth(1)
            .strokeColor(colors.brandMuted)
            .stroke();

        doc.fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(colors.brandDark)
            .text("DOCTOR'S SIGNATURE", 350, bottomY + 20, { align: 'center', width: 200 });

        // --- QR Code ---
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationUrl = `${frontendUrl}/verify-prescription/${prescription.id}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

            doc.image(qrCodeDataUrl, 500, bottomY - 10, { width: 50 });
            doc.fontSize(6)
                .fillColor(colors.brandMuted)
                .text('Scan to verify', 500, bottomY + 45, { width: 50, align: 'center' });
        } catch (err) {
            console.error('Error generating QR code:', err);
        }

        doc.end();

        return `/uploads/prescriptions/${fileName}`;
    }

    async findAllForPatient(patientId: string): Promise<Prescription[]> {
        return this.prescriptionModel.findAll({
            where: { patientId },
            include: [
                {
                    model: Doctor,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'email'],
                            include: [{ model: UserProfile, attributes: ['firstName', 'lastName'] }]
                        }
                    ]
                }
            ],
            order: [['date', 'DESC']],
        });
    }

    async findAllForDoctor(doctorId: string): Promise<Prescription[]> {
        return this.prescriptionModel.findAll({
            where: { doctorId },
            include: [{ model: User, attributes: ['id', 'email'] }],
            order: [['date', 'DESC']],
        });
    }

    async findOne(id: string): Promise<Prescription | null> {
        return this.prescriptionModel.findByPk(id);
    }
}
