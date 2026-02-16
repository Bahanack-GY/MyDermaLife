import { Controller, Get, Param, UseGuards, Req, Patch, Post, Delete, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { medicalDocumentMulterOptions } from '../uploads/multer-config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DoctorsService } from '../doctors/doctors.service';

@ApiTags('Patients')
@Controller('doctor/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class PatientsController {
    constructor(
        private readonly patientsService: PatientsService,
        private readonly doctorsService: DoctorsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all patients for the current doctor' })
    async findAll(@Req() req) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        const patients = await this.patientsService.findAll(doctor.id);

        const mappedPatients = patients.map(user => {
            const profile = user.profile;
            const age = profile?.dateOfBirth ? this.calculateAge(new Date(profile.dateOfBirth)) : 0;
            return {
                id: user.id,
                name: profile ? `${profile.firstName} ${profile.lastName}` : user.email,
                email: user.email,
                phone: user.phone,
                age: age,
                gender: profile?.gender,
                dateOfBirth: profile?.dateOfBirth,
                bloodType: undefined, // specific field not found in profile
                allergies: profile?.medicalRecord?.allergies || [],
                status: user.status === 'active' ? 'Active' : 'Inactive',
                photoUrl: profile?.profilePhoto,
                lastVisit: user.updatedAt, // Using updated at as proxy for now
                insuranceStatus: 'Active',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        });

        return {
            data: mappedPatients,
            meta: {
                total: mappedPatients.length,
                page: 1,
                limit: mappedPatients.length,
                totalPages: 1
            }
        };
    }

    private calculateAge(birthday: Date) {
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get patient details' })
    async findOne(@Param('id') id: string) {
        const user = await this.patientsService.findOne(id);
        const profile = user.profile;
        const age = profile?.dateOfBirth ? this.calculateAge(new Date(profile.dateOfBirth)) : 0;

        return {
            id: user.id,
            name: profile ? `${profile.firstName} ${profile.lastName}` : user.email,
            email: user.email,
            phone: user.phone,
            age: age,
            gender: profile?.gender,
            dateOfBirth: profile?.dateOfBirth,
            bloodType: undefined, // Mock/Extract
            healthId: 'HID-29384', // Mock
            height: '165 cm', // Mock or Vitals
            weight: '58 kg', // Mock or Vitals
            allergies: profile?.medicalRecord?.allergies || [],
            chronicConditions: profile?.medicalRecord?.history?.filter(h => h.status === 'ongoing').map(h => h.condition) || [],
            currentTreatments: profile?.medicalRecord?.currentTreatments || [],
            skinRiskFactors: profile?.medicalRecord?.skinRiskFactors,
            insuranceNumber: profile?.insuranceNumber,
            medicalRecord: {
                allergies: profile?.medicalRecord?.allergies || [],
                history: profile?.medicalRecord?.history || [],
                vaccines: profile?.medicalRecord?.vaccines || [],
                clinicalNotes: profile?.medicalRecord?.clinicalNotes,
            },
            status: user.status === 'active' ? 'Active' : 'Inactive',
            photoUrl: profile?.profilePhoto,
            lastVisit: user.updatedAt,
            insuranceStatus: 'Active',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Get patient dashboard stats' })
    async getStats(@Param('id') id: string) {
        return this.patientsService.getPatientStats(id);
    }

    @Get(':id/vitals')
    @ApiOperation({ summary: 'Get patient latest vitals' })
    async getVitals(@Param('id') id: string) {
        return this.patientsService.getPatientVitals(id);
    }

    @Get(':id/medical-history')
    @ApiOperation({ summary: 'Get patient medical history' })
    async getMedicalHistory(@Param('id') id: string) {
        return this.patientsService.getMedicalHistory(id);
    }

    @Get(':id/photos')
    @ApiOperation({ summary: 'Get patient photos' })
    async getPhotos(@Param('id') id: string) {
        return this.patientsService.getPatientPhotos(id);
    }

    @Patch(':id/medical-record')
    @ApiOperation({ summary: 'Update patient medical record' })
    async updateMedicalRecord(
        @Param('id') id: string,
        @Body() updateData: { clinicalNotes?: string; chronicConditions?: string[] }
    ) {
        return this.patientsService.updateMedicalRecord(id, updateData);
    }

    @Post(':id/medical-history')
    @ApiOperation({ summary: 'Add medical history event' })
    async addMedicalHistoryEvent(
        @Param('id') id: string,
        @Body() eventData: { title: string; description?: string; date: string; type: string }
    ) {
        return this.patientsService.addMedicalHistoryEvent(id, eventData);
    }

    @Patch(':id/medical-history/:eventId')
    @ApiOperation({ summary: 'Update medical history event' })
    async updateMedicalHistoryEvent(
        @Param('id') id: string,
        @Param('eventId') eventId: string,
        @Body() eventData: { title?: string; description?: string; date?: string; type?: string }
    ) {
        return this.patientsService.updateMedicalHistoryEvent(id, eventId, eventData);
    }

    @Delete(':id/medical-history/:eventId')
    @ApiOperation({ summary: 'Delete medical history event' })
    async deleteMedicalHistoryEvent(
        @Param('id') id: string,
        @Param('eventId') eventId: string
    ) {
        return this.patientsService.deleteMedicalHistoryEvent(id, eventId);
    }

    // --- Medical Documents ---

    @Post(':id/documents')
    @ApiOperation({ summary: 'Upload medical document' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                category: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                date: { type: 'string' },
                metadata: { type: 'string' } // JSON string
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', medicalDocumentMulterOptions))
    async uploadMedicalDocument(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Req() req
    ) {
        const doctorId = (await this.doctorsService.findByUserId(req.user.id)).id;

        return this.patientsService.createMedicalDocument(id, doctorId, file, {
            category: body.category,
            title: body.title,
            description: body.description,
            date: body.date,
            metadata: body.metadata ? JSON.parse(body.metadata) : undefined
        });
    }

    @Get(':id/documents')
    @ApiOperation({ summary: 'Get medical documents' })
    async getMedicalDocuments(@Param('id') id: string) {
        return this.patientsService.getMedicalDocuments(id);
    }

    @Delete(':id/documents/:documentId')
    @ApiOperation({ summary: 'Delete medical document' })
    async deleteMedicalDocument(@Param('documentId') documentId: string) {
        return this.patientsService.deleteMedicalDocument(documentId);
    }

    // --- Extended Medical Record Fields ---

    @Patch(':id/insurance')
    @ApiOperation({ summary: 'Update insurance number' })
    async updateInsuranceNumber(
        @Param('id') id: string,
        @Body() body: { insuranceNumber: string }
    ) {
        return this.patientsService.updateInsuranceNumber(id, body.insuranceNumber);
    }

    @Patch(':id/treatments')
    @ApiOperation({ summary: 'Update current treatments' })
    async updateCurrentTreatments(
        @Param('id') id: string,
        @Body() body: { treatments: any[] }
    ) {
        return this.patientsService.updateCurrentTreatments(id, body.treatments);
    }

    @Patch(':id/risk-factors')
    @ApiOperation({ summary: 'Update skin risk factors' })
    async updateSkinRiskFactors(
        @Param('id') id: string,
        @Body() body: { factors: any }
    ) {
        return this.patientsService.updateSkinRiskFactors(id, body.factors);
    }
}
