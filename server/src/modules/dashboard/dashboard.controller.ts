import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DoctorsService } from '../doctors/doctors.service';

@ApiTags('Dashboard')
@Controller('doctor/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly doctorsService: DoctorsService,
    ) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get doctor dashboard statistics' })
    async getStats(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        return this.dashboardService.getStats(doctor.id, startDate, endDate);
    }

    @Get('visits')
    @ApiOperation({ summary: 'Get patient visits overview' })
    async getVisits(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        return this.dashboardService.getVisits(doctor.id, startDate, endDate);
    }

    @Get('upcoming')
    @ApiOperation({ summary: 'Get upcoming schedule' })
    async getUpcoming(@Req() req) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        return this.dashboardService.getUpcoming(doctor.id);
    }

    @Get('pathologies')
    @ApiOperation({ summary: 'Get common pathologies stats' })
    async getPathologies(@Req() req) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        return this.dashboardService.getPathologies(doctor.id);
    }

    @Get('revenue')
    @ApiOperation({ summary: 'Get monthly revenue stats' })
    async getRevenue(@Req() req) {
        const userId = req.user.id;
        const doctor = await this.doctorsService.findByUserId(userId);
        return this.dashboardService.getRevenue(doctor.id);
    }
}
