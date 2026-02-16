import { Controller, Get, Post, Body, UseGuards, Param, NotFoundException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response as ExpressResponse } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Prescriptions')
@ApiBearerAuth('JWT-auth')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
    constructor(
        private readonly prescriptionsService: PrescriptionsService,
        private readonly doctorsService: DoctorsService
    ) { }

    @Post()
    @Roles(UserRole.DOCTOR)
    @ApiOperation({ summary: 'Create a prescription' })
    @ApiResponse({ status: 201, description: 'Prescription created' })
    async create(
        @CurrentUser() user: any,
        @Body() createPrescriptionDto: CreatePrescriptionDto,
    ) {
        const doctor = await this.doctorsService.findByUserId(user.id);
        return this.prescriptionsService.create(doctor.id, createPrescriptionDto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my prescriptions' })
    async findAll(@CurrentUser() user: any) {
        if (user.role === UserRole.PATIENT) {
            return this.prescriptionsService.findAllForPatient(user.id);
        } else if (user.role === UserRole.DOCTOR) {
            return this.prescriptionsService.findAllForDoctor(user.id);
        }
        return [];
    }

    @Get('verify/:id')
    @Public()
    @ApiOperation({ summary: 'Verify a prescription (Public)' })
    @ApiResponse({ status: 200, description: 'Prescription details' })
    async verify(@Param('id') id: string) {
        const prescription = await this.prescriptionsService.findOne(id);
        if (!prescription) {
            throw new NotFoundException('Prescription not found');
        }

        // Return limited public info
        return {
            isValid: true,
            id: prescription.id,
            date: prescription.date,
            doctorName: `Dr. ${prescription.doctor?.user?.profile?.firstName} ${prescription.doctor?.user?.profile?.lastName}`,
            patientName: `${prescription.patient?.profile?.firstName} ${prescription.patient?.profile?.lastName}`, // Maybe mask this in prod?
            pdfUrl: `/prescriptions/download/${id}/public`
        };
    }

    @Get('download/:id/public')
    @Public()
    @ApiOperation({ summary: 'Download prescription PDF (Public)' })
    async download(@Param('id') id: string, @Res() res: ExpressResponse) {
        const prescription = await this.prescriptionsService.findOne(id);
        if (!prescription || !prescription.pdfUrl) {
            throw new NotFoundException('Prescription or PDF not found');
        }

        // prescription.pdfUrl is relative like /uploads/prescriptions/...
        // We need the absolute path to the file on disk
        // Assuming pdfUrl is stored as /uploads/prescriptions/filename.pdf
        // and physically located at projectRoot/uploads/prescriptions/filename.pdf
        const fileName = path.basename(prescription.pdfUrl);
        const filePath = path.join(process.cwd(), 'uploads', 'prescriptions', fileName);

        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            throw new NotFoundException('File not found on server');
        }
    }
}
