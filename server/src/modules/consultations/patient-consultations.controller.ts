import { Controller, Get, Patch, Post, Param, UseGuards, Req, Body, NotFoundException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Patient Consultations')
@ApiBearerAuth('JWT-auth')
@Controller('patient-consultations')
// @UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
export class PatientConsultationsController {
    constructor(
        private readonly consultationsService: ConsultationsService,
    ) { }

    @Get('my')
    @ApiOperation({ summary: 'Get my appointments (upcoming and past)' })
    async getMyAppointments(@Req() req) {
        return this.consultationsService.findAllForPatient(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a consultation by ID' })
    async getConsultationById(@Param('id') id: string, @Req() req) {
        const consultation = await this.consultationsService.findOne(id);
        if (consultation.patientId !== req.user.id) {
            throw new NotFoundException('Consultation not found');
        }
        return this.toConsultationDto(consultation);
    }

    private toConsultationDto(consultation: any) {
        const dto = consultation.toJSON ? consultation.toJSON() : consultation;

        // Manual sanitization to break circular references
        if (dto.patient) {
            delete dto.patient.password;
            if (dto.patient.profile) {
                // Break circular Ref: Profile -> User
                delete dto.patient.profile.user;
            }
        }

        if (dto.doctor) {
            if (dto.doctor.user) {
                delete dto.doctor.user.password;
                if (dto.doctor.user.profile) {
                    // Break circular Ref: Doctor -> User -> Profile -> User
                    delete dto.doctor.user.profile.user;
                }
            }
        }

        return dto;
    }

    @Post('book')
    @ApiOperation({ summary: 'Book a new consultation' })
    async bookConsultation(
        @Req() req,
        @Body() body: {
            doctorId: string;
            consultationType: string;
            scheduledDate: string;
            chiefComplaint?: string;
        }
    ) {
        return this.consultationsService.create({
            ...body,
            patientId: req.user.id,
            scheduledDate: new Date(body.scheduledDate)
        });
    }

    @Patch(':id/accept')
    @ApiOperation({ summary: 'Accept a proposed consultation' })
    async acceptConsultation(@Param('id') id: string, @Req() req) {
        return this.consultationsService.acceptConsultation(id, req.user.id);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject a proposed consultation' })
    async rejectConsultation(@Param('id') id: string, @Req() req) {
        return this.consultationsService.rejectConsultation(id, req.user.id);
    }

    @Patch(':id/join')
    @ApiOperation({ summary: 'Join waiting room' })
    async joinWaitingRoom(@Param('id') id: string, @Req() req) {
        return this.consultationsService.joinWaitingRoom(id, req.user.id);
    }

    @Patch(':id/leave')
    @ApiOperation({ summary: 'Leave waiting room' })
    async leaveWaitingRoom(@Param('id') id: string, @Req() req) {
        return this.consultationsService.leaveWaitingRoom(id, req.user.id);
    }
    @Patch(':id/finish')
    @ApiOperation({ summary: 'Finish consultation (Mark as completed by patient)' })
    async finishConsultation(@Param('id') id: string, @Req() req) {
        return this.consultationsService.finishConsultationByPatient(id, req.user.id);
    }
}
