import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { ConsultationsService } from '../../consultations/consultations.service';

describe('DashboardService', () => {
    let service: DashboardService;
    let consultationsService: Partial<ConsultationsService>;

    const mockStats = {
        todaysAppointments: 5,
        totalPatients: 100,
        totalConsultations: 200,
        totalRevenue: 50000,
        patientsChange: 5,
        appointmentsChange: 2,
        revenueChange: 10,
        consultationsChange: 3
    };

    beforeEach(async () => {
        consultationsService = {
            getStats: jest.fn().mockResolvedValue(mockStats),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
                { provide: ConsultationsService, useValue: consultationsService },
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getStats', () => {
        it('should return stats for a doctor', async () => {
            const result = await service.getStats('doctor-123');

            expect(result).toEqual(mockStats);
            expect(consultationsService.getStats).toHaveBeenCalledWith('doctor-123');
        });
    });
});
