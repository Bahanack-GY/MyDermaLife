import { Controller, Get, Param, Query, Req, Res, UseGuards, NotFoundException, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { DoctorsService } from '../doctors/doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Reports')
@Controller('doctor/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly doctorsService: DoctorsService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get consultation reports for the current doctor' })
    async findAll(
        @Req() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const doctor = await this.doctorsService.findByUserId(req.user.id);
        if (!doctor) return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };

        return this.reportsService.findAll(doctor.id, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
            search,
            startDate,
            endDate,
        });
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Download report as PDF' })
    async downloadPdf(@Param('id') id: string, @Req() req, @Res({ passthrough: true }) res: Response) {
        const doctor = await this.doctorsService.findByUserId(req.user.id);
        if (!doctor) throw new NotFoundException('Doctor not found');

        const pdfBuffer = await this.reportsService.generatePdf(id, doctor.id);
        if (!pdfBuffer) throw new NotFoundException('Report not found');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="rapport-${id.substring(0, 8)}.pdf"`,
        });

        return new StreamableFile(pdfBuffer);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get report details' })
    async findOne(@Param('id') id: string, @Req() req) {
        const doctor = await this.doctorsService.findByUserId(req.user.id);
        if (!doctor) throw new NotFoundException('Doctor not found');

        const report = await this.reportsService.findOne(id, doctor.id);
        if (!report) throw new NotFoundException('Report not found');

        return report;
    }
}
