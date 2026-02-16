import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from '../patients.service';
import { UsersService } from '../../users/users.service';
import { ConsultationsService } from '../../consultations/consultations.service';
import { User } from '../../users/entities/user.entity';

describe('PatientsService', () => {
    let service: PatientsService;
    let usersService: Partial<UsersService>;
    let consultationsService: Partial<ConsultationsService>;

    const mockUser = {
        id: 'patient-123',
        email: 'patient@example.com',
        role: 'patient',
    } as User;

    const mockConsultation = {
        id: 'consultation-123',
        patientId: 'patient-123',
        doctorId: 'doctor-456',
    };

    beforeEach(async () => {
        usersService = {
            findById: jest.fn().mockResolvedValue(mockUser),
        };
        consultationsService = {
            findAll: jest.fn().mockResolvedValue([mockConsultation]),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PatientsService,
                { provide: UsersService, useValue: usersService },
                { provide: ConsultationsService, useValue: consultationsService },
            ],
        }).compile();

        service = module.get<PatientsService>(PatientsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return list of unique patients for a doctor', async () => {
            const patients = await service.findAll('doctor-456');
            expect(patients).toHaveLength(1);
            expect(patients[0].id).toBe('patient-123');
            expect(consultationsService.findAll).toHaveBeenCalledWith('doctor-456');
            expect(usersService.findById).toHaveBeenCalledWith('patient-123');
        });

        it('should return empty list if no consultations found', async () => {
            jest.spyOn(consultationsService, 'findAll').mockResolvedValue([]);
            const patients = await service.findAll('doctor-456');
            expect(patients).toHaveLength(0);
        });
    });

    describe('findOne', () => {
        it('should return a patient by id', async () => {
            const patient = await service.findOne('patient-123');
            expect(patient).toBeDefined();
            expect(patient.id).toBe('patient-123');
        });

        it('should throw simple exception (or return null depending solely on service logic) if not found', async () => {
            // The service implementation throws NotFoundException
            jest.spyOn(usersService, 'findById').mockResolvedValue(null);
            await expect(service.findOne('invalid-id')).rejects.toThrow();
        });
    });
});
