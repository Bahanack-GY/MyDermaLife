import { Injectable } from '@nestjs/common';
import { ConsultationsService } from '../consultations/consultations.service';

@Injectable()
export class DashboardService {
    constructor(
        private consultationsService: ConsultationsService,
    ) { }

    async getStats(doctorId: string, startDate?: string, endDate?: string) {
        return this.consultationsService.getStats(doctorId, startDate, endDate);
    }

    async getVisits(doctorId: string, startDate?: string, endDate?: string) {
        return this.consultationsService.getVisitsOverview(doctorId, startDate, endDate);
    }

    async getUpcoming(doctorId: string) {
        return this.consultationsService.getUpcomingSchedule(doctorId);
    }

    async getPathologies(doctorId: string) {
        return this.consultationsService.getPathologiesStats(doctorId);
    }

    async getRevenue(doctorId: string) {
        return this.consultationsService.getMonthlyRevenue(doctorId);
    }
}
