import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: Partial<UsersService>;
    let jwtService: Partial<JwtService>;

    const mockUser = {
        id: 'user-123',
        email: 'doctor@example.com',
        passwordHash: 'hashedpassword',
        role: UserRole.DOCTOR,
        status: 'active',
        validatePassword: jest.fn().mockResolvedValue(true),
        profile: {
            firstName: 'John',
            lastName: 'Doe',
        },
    };

    beforeEach(async () => {
        usersService = {
            findByEmail: jest.fn(),
            isAccountLocked: jest.fn().mockResolvedValue(false),
            incrementFailedLogin: jest.fn(),
            createSession: jest.fn(),
            updateLastLogin: jest.fn(),
        };

        jwtService = {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should return tokens and user info for valid doctor credentials', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.login({
                email: 'doctor@example.com',
                password: 'password',
            });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.role).toBe(UserRole.DOCTOR);
            expect(usersService.createSession).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            const userWithInvalidPass = { ...mockUser, validatePassword: jest.fn().mockResolvedValue(false) };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(userWithInvalidPass);

            await expect(service.login({
                email: 'doctor@example.com',
                password: 'wrongpassword',
            })).rejects.toThrow(UnauthorizedException);
        });
    });
});
