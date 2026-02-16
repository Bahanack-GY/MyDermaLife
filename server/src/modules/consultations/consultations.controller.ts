import { Controller, Get, Post, Param, UseGuards, Req, Query, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { DoctorsService } from '../doctors/doctors.service';
import { recordingMulterOptions } from '../uploads/multer-config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RateConsultationDto } from './dto/rate-consultation.dto';

@ApiTags('Consultations')
@Controller('doctor/consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class ConsultationsController {
    constructor(
        private readonly consultationsService: ConsultationsService,
        private readonly doctorsService: DoctorsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all consultations for the current doctor' })
    async findAll(@Req() req) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        if (!doctor) return [];
        return this.consultationsService.findAll(doctor.id);
    }

    @Get('daily/schedule')
    @ApiOperation({ summary: 'Get daily appointments' })
    async getDaily(@Req() req, @Query('date') dateStr?: string) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        if (!doctor) return [];
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.consultationsService.getDailyAppointments(doctor.id, date);
    }

    @Post('sync-stats')
    @ApiOperation({ summary: 'Force sync doctor stats (Debug/Admin)' })
    async syncStats(@Req() req) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        if (doctor) {
            await this.consultationsService.updateDoctorStats(doctor.id);
            return { message: 'Stats synced successfully' };
        }
        return { message: 'Doctor profile not found' };
    }

    @Post(':id/recall')
    @ApiOperation({ summary: 'Send recall to patient' })
    async sendRecall(@Param('id') id: string) {
        return this.consultationsService.sendRecall(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get consultation details' })
    async findOne(@Param('id') id: string) {
        return this.consultationsService.findOne(id);
    }

    @Post(':id/rate')
    @Roles(UserRole.PATIENT)
    @ApiOperation({ summary: 'Rate a consultation' })
    async rate(
        @Param('id') id: string,
        @Body() rateDto: RateConsultationDto,
        @Req() req
    ) {
        return this.consultationsService.rateConsultation(
            id,
            req.user.id,
            rateDto.rating,
            rateDto.review
        );
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Mark consultation as completed' })
    async complete(
        @Param('id') id: string,
        @Req() req
    ) {
        const doctor = await this.doctorsService.findByUserId(req.user.id);
        return this.consultationsService.completeConsultation(id, doctor.id);
    }

    @Post(':id/recording')
    @ApiOperation({ summary: 'Upload consultation audio recording' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', recordingMulterOptions))
    async uploadRecording(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.consultationsService.saveRecording(id, file);
    }
}
