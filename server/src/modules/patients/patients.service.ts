import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersService } from '../users/users.service';
import { ConsultationsService } from '../consultations/consultations.service';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { MedicalDocument } from './entities/medical-document.entity';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class PatientsService {
    constructor(
        private usersService: UsersService,
        private consultationsService: ConsultationsService,
        @InjectModel(UserProfile)
        private userProfileModel: typeof UserProfile,
        @InjectModel(MedicalDocument)
        private medicalDocumentModel: typeof MedicalDocument,
        private uploadsService: UploadsService,
    ) { }

    async findAll(doctorId: string): Promise<User[]> {
        // Get all consultations for this doctor to find their patients
        // This is a bit inefficient if we fetch ALL consultations.
        // Ideally we'd have a method in ConsultationsService to get distinct patient IDs.
        // For now, let's assume we can get all and filter. 
        // Optimization: Add getPatientIdsForDoctor to ConsultationsService later.
        const consultations = await this.consultationsService.findAll(doctorId);

        const patientIds = new Set(consultations.map(c => c.patientId));

        if (patientIds.size === 0) {
            return [];
        }

        // We can't easily do "findByIds" on usersService without adding it.
        // Let's assume we iterate for now or add findByIds to UsersService.
        // Getting distinct patients one by one:
        const patients: User[] = [];
        for (const patientId of patientIds) {
            const patient = await this.usersService.findById(patientId);
            if (patient) {
                patients.push(patient);
            }
        }

        return patients;
    }

    async findOne(id: string): Promise<User> {
        const patient = await this.usersService.findById(id);
        if (!patient) {
            throw new NotFoundException('Patient not found');
        }
        return patient;
    }

    async getPatientStats(patientId: string) {
        // Fetch actual consultations
        const consultations = await this.consultationsService.findAllForPatient(patientId);

        const totalConsultations = consultations.length;
        const lastVisit = consultations.length > 0 ? consultations[consultations.length - 1].scheduledDate : null;

        // Calculate visits by month
        const visitsByMonth = this.calculateVisitsByMonth(consultations);

        return {
            totalConsultations,
            lastVisit,
            insuranceStatus: 'Active',
            visitsByMonth
        };
    }

    private calculateVisitsByMonth(consultations: any[]) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const result: { month: string; visits: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();
            const monthName = months[monthIdx];

            const count = consultations.filter(c => {
                const cDate = new Date(c.scheduledDate);
                return cDate.getMonth() === monthIdx && cDate.getFullYear() === year;
            }).length;

            result.push({ month: monthName, visits: count });
        }
        return result;
    }

    async getPatientVitals(patientId: string) {
        // Try to get from latest consultation or user profile
        // Since Vitals entity doesn't exist, we'll try to extract from user profile metadata if available,
        // or return nulls effectively "from server" but empty.
        // For demonstration, we assume they might be stored in future in medicalRecord.vitals
        const user = await this.findOne(patientId);
        const record = user.profile?.medicalRecord as any;

        return {
            height: record?.vitals?.height || 0,
            weight: record?.vitals?.weight || 0,
            bloodPressure: record?.vitals?.bloodPressure || 'N/A',
            heartRate: record?.vitals?.heartRate || 0,
            recordedAt: user.updatedAt.toISOString()
        };
    }

    async getMedicalHistory(patientId: string) {
        const user = await this.findOne(patientId);
        const history = user.profile?.medicalRecord?.history || [];

        // Map to frontend format if necessary, assuming stored format matches or is close
        return history.map((item: any) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            title: item.condition || item.title || 'Event',
            description: item.description || item.status || '',
            date: item.date || new Date().toISOString().split('T')[0],
            type: item.type || 'checkup'
        }));
    }

    async getPatientPhotos(patientId: string) {
        const skinLogs = await this.usersService.findAllSkinLogs(patientId);

        return skinLogs.map(log => ({
            id: log.id,
            date: new Date(log.date).toISOString().split('T')[0],
            title: log.title || 'Skin Log',
            description: log.note || '',
            url: log.photoUrl,
            type: 'skin_log'
        }));
    }

    async updateMedicalRecord(patientId: string, updateData: { clinicalNotes?: string; chronicConditions?: string[] }) {
        const user = await this.findOne(patientId);

        if (!user.profile) {
            throw new NotFoundException('Patient profile not found');
        }

        const currentMedicalRecord = user.profile.medicalRecord || {};
        const updatedMedicalRecord = {
            ...currentMedicalRecord,
            ...(updateData.clinicalNotes !== undefined && { clinicalNotes: updateData.clinicalNotes }),
            ...(updateData.chronicConditions !== undefined && {
                chronicConditions: updateData.chronicConditions
            })
        };

        await this.userProfileModel.update(
            { medicalRecord: updatedMedicalRecord },
            { where: { userId: patientId } }
        );

        return { message: 'Medical record updated successfully' };
    }

    async addMedicalHistoryEvent(patientId: string, eventData: { title: string; description?: string; date: string; type: string }) {
        const user = await this.findOne(patientId);

        if (!user.profile) {
            throw new NotFoundException('Patient profile not found');
        }

        const currentMedicalRecord = user.profile.medicalRecord || {};
        const currentHistory = currentMedicalRecord.history || [];

        const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
            condition: eventData.title,
            title: eventData.title,
            description: eventData.description || '',
            date: eventData.date,
            type: eventData.type,
            status: 'completed'
        };

        const updatedHistory = [...currentHistory, newEvent];

        await this.userProfileModel.update(
            { medicalRecord: { ...currentMedicalRecord, history: updatedHistory } },
            { where: { userId: patientId } }
        );

        return newEvent;
    }

    async updateMedicalHistoryEvent(patientId: string, eventId: string, eventData: { title?: string; description?: string; date?: string; type?: string }) {
        const user = await this.findOne(patientId);

        if (!user.profile) {
            throw new NotFoundException('Patient profile not found');
        }

        const currentMedicalRecord = user.profile.medicalRecord || {};
        const currentHistory = currentMedicalRecord.history || [];

        const eventIndex = currentHistory.findIndex((event: any) => event.id === eventId);

        if (eventIndex === -1) {
            throw new NotFoundException('Medical history event not found');
        }

        const updatedEvent = {
            ...currentHistory[eventIndex],
            ...(eventData.title !== undefined && { condition: eventData.title, title: eventData.title }),
            ...(eventData.description !== undefined && { description: eventData.description }),
            ...(eventData.date !== undefined && { date: eventData.date }),
            ...(eventData.type !== undefined && { type: eventData.type })
        };

        currentHistory[eventIndex] = updatedEvent;

        await this.userProfileModel.update(
            { medicalRecord: { ...currentMedicalRecord, history: currentHistory } },
            { where: { userId: patientId } }
        );

        return updatedEvent;
    }

    async deleteMedicalHistoryEvent(patientId: string, eventId: string) {
        const user = await this.findOne(patientId);

        if (!user.profile) {
            throw new NotFoundException('Patient profile not found');
        }

        const currentMedicalRecord = user.profile.medicalRecord || {};
        const currentHistory = currentMedicalRecord.history || [];

        const filteredHistory = currentHistory.filter((event: any) => event.id !== eventId);

        if (filteredHistory.length === currentHistory.length) {
            throw new NotFoundException('Medical history event not found');
        }

        await this.userProfileModel.update(
            { medicalRecord: { ...currentMedicalRecord, history: filteredHistory } },
            { where: { userId: patientId } }
        );

        return { message: 'Medical history event deleted successfully' };
    }

    // --- Medical Documents ---

    async createMedicalDocument(
        patientId: string,
        doctorId: string,
        file: Express.Multer.File,
        data: { category: string; title: string; description?: string; metadata?: any; date?: string }
    ) {
        return this.uploadsService.saveMedicalDocument(patientId, doctorId, file, data);
    }

    async getMedicalDocuments(patientId: string) {
        return this.medicalDocumentModel.findAll({
            where: { patientId },
            order: [['date', 'DESC'], ['createdAt', 'DESC']],
            include: ['doctor']
        });
    }

    async deleteMedicalDocument(id: string) {
        // We need to implement delete in UploadsService to handle file deletion
        return this.uploadsService.deleteMedicalDocument(id);
    }

    // --- Extended Medical Record Fields ---

    async updateInsuranceNumber(patientId: string, insuranceNumber: string) {
        const user = await this.findOne(patientId);
        if (!user.profile) throw new NotFoundException('Profile not found');

        await user.profile.update({ insuranceNumber });
        return { message: 'Insurance number updated' };
    }

    async updateCurrentTreatments(patientId: string, treatments: any[]) {
        const user = await this.findOne(patientId);
        if (!user.profile) throw new NotFoundException('Profile not found');

        const currentRecord = user.profile.medicalRecord || {};
        const updatedRecord = { ...currentRecord, currentTreatments: treatments };

        await user.profile.update({ medicalRecord: updatedRecord });
        return { message: 'Treatments updated' };
    }

    async updateSkinRiskFactors(patientId: string, factors: any) {
        const user = await this.findOne(patientId);
        if (!user.profile) throw new NotFoundException('Profile not found');

        const currentRecord = user.profile.medicalRecord || {};
        const updatedRecord = { ...currentRecord, skinRiskFactors: factors };

        await user.profile.update({ medicalRecord: updatedRecord });
        return { message: 'Risk factors updated' };
    }
}
