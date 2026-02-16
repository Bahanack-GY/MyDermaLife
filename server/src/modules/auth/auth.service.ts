import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private doctorsService: DoctorsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto, ipAddress?: string): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      phone: registerDto.phone,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : undefined,
      gender: registerDto.gender,
    });

    const tokens = await this.generateTokens(user);

    await this.usersService.createSession(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
      new Date(Date.now() + this.getExpiresInMs()),
      ipAddress,
    );

    if (ipAddress) {
      await this.usersService.updateLastLogin(user.id, ipAddress);
    }

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (await this.usersService.isAccountLocked(user.id)) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      await this.usersService.incrementFailedLogin(user.id);
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    await this.usersService.createSession(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
      new Date(Date.now() + this.getExpiresInMs()),
      ipAddress,
      userAgent,
    );

    if (ipAddress) {
      await this.usersService.updateLastLogin(user.id, ipAddress);
    }

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  async doctorLogin(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const authResponse = await this.login(loginDto, ipAddress, userAgent);

    if (authResponse.user.role !== UserRole.DOCTOR) {
      throw new UnauthorizedException('User is not a doctor');
    }

    const doctor = await this.doctorsService.findByUserId(authResponse.user.id);

    return {
      ...authResponse,
      doctor,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const session = await this.usersService.findSessionByRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.isExpired || session.isRevoked) {
      throw new UnauthorizedException('Refresh token has expired or been revoked');
    }

    const user = await this.usersService.findById(session.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.usersService.revokeSession(session.id);

    const tokens = await this.generateTokens(user);

    await this.usersService.createSession(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
      new Date(Date.now() + this.getExpiresInMs()),
      session.ipAddress,
      session.userAgent,
    );

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  async logout(userId: string, token: string): Promise<void> {
    const session = await this.usersService.findSessionByToken(token);
    if (session) {
      await this.usersService.revokeSession(session.id);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.usersService.revokeAllUserSessions(userId);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.formatUserResponse(user);
  }

  async getDoctorProfile(userId: string) {
    return this.doctorsService.findByUserId(userId);
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string; expiresIn: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: 604800, // 7 days in seconds
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: 2592000, // 30 days in seconds
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: '7d',
    };
  }

  private formatUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile
        ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          profilePhoto: user.profile.profilePhoto,
          medicalRecord: user.profile.medicalRecord,
        }
        : null,
    };
  }

  private getExpiresInMs(): number {
    return 7 * 24 * 60 * 60 * 1000; // 7 days
  }
}
