import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserSession } from './entities/user-session.entity';
import { SkinLog } from './entities/skin-log.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateSkinLogDto } from './dto/create-skin-log.dto';

interface CreateUserServiceDto {
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserProfile)
    private userProfileModel: typeof UserProfile,
    @InjectModel(UserSession)
    private userSessionModel: typeof UserSession,
    @InjectModel(SkinLog)
    private skinLogModel: typeof SkinLog,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email: email.toLowerCase() },
      include: [UserProfile],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id, {
      include: [UserProfile],
    });
  }

  async create(createUserDto: CreateUserDto | CreateUserServiceDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userModel.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash: createUserDto.password,
      phone: createUserDto.phone,
      role: createUserDto.role || UserRole.PATIENT,
    });

    await this.userProfileModel.create({
      userId: user.id,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      dateOfBirth: createUserDto.dateOfBirth,
      gender: createUserDto.gender,
    });

    const createdUser = await this.findById(user.id);
    if (!createdUser) {
      throw new Error('Failed to create user');
    }
    return createdUser;
  }

  async updateLastLogin(userId: string, ipAddress: string): Promise<void> {
    await this.userModel.update(
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        failedLoginCount: 0,
      },
      { where: { id: userId } },
    );
  }

  async incrementFailedLogin(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;

    const failedCount = user.failedLoginCount + 1;
    const updateData: any = { failedLoginCount: failedCount };

    if (failedCount >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.userModel.update(updateData, { where: { id: userId } });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.lockedUntil) return false;
    return new Date() < user.lockedUntil;
  }

  async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserSession> {
    return this.userSessionModel.create({
      userId,
      token,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent,
      deviceType: this.detectDeviceType(userAgent),
    });
  }

  async findSessionByToken(token: string): Promise<UserSession | null> {
    return this.userSessionModel.findOne({
      where: { token },
      include: [User],
    });
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.userSessionModel.findOne({
      where: { refreshToken },
      include: [User],
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.userSessionModel.update(
      { revokedAt: new Date() },
      { where: { id: sessionId } },
    );
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.userSessionModel.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } },
    );
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.userSessionModel.update(
      { lastActivityAt: new Date() },
      { where: { id: sessionId } },
    );
  }

  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return 'mobile';
    if (ua.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  // Get allowed roles based on requester's role
  private getAllowedRolesForUser(requesterRole: UserRole): UserRole[] {
    switch (requesterRole) {
      case UserRole.SUPER_ADMIN:
        // Super admin can see everyone
        return Object.values(UserRole);
      case UserRole.ADMIN:
        // Admin can see doctors and patients
        return [UserRole.DOCTOR, UserRole.PATIENT];
      case UserRole.DOCTOR:
        // Doctor can only see patients
        return [UserRole.PATIENT];
      default:
        return [];
    }
  }

  async findAll(
    query: QueryUserDto,
    requesterRole: UserRole,
  ): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const { role, status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const allowedRoles = this.getAllowedRolesForUser(requesterRole);
    if (allowedRoles.length === 0) {
      throw new ForbiddenException('You do not have permission to view users');
    }

    const whereClause: any = {};

    // Role filtering based on requester permissions
    if (role) {
      if (!allowedRoles.includes(role)) {
        throw new ForbiddenException(`You do not have permission to view ${role} users`);
      }
      whereClause.role = role;
    } else {
      whereClause.role = { [Op.in]: allowedRoles };
    }

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { '$profile.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$profile.last_name$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.userModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: UserProfile,
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findOne(id: string, requesterRole: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedRoles = this.getAllowedRolesForUser(requesterRole);
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to view this user');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, requesterRole: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedRoles = this.getAllowedRolesForUser(requesterRole);
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    // Prevent role escalation
    if (updateUserDto.role) {
      if (requesterRole !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only super admins can change user roles');
      }
      // Super admin cannot change another super admin's role
      if (user.role === UserRole.SUPER_ADMIN && updateUserDto.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Cannot change super admin role');
      }
    }

    // Check for email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update user fields
    const userUpdateData: any = {};
    if (updateUserDto.email) userUpdateData.email = updateUserDto.email;
    if (updateUserDto.password) userUpdateData.passwordHash = updateUserDto.password;
    if (updateUserDto.phone !== undefined) userUpdateData.phone = updateUserDto.phone;
    if (updateUserDto.role) userUpdateData.role = updateUserDto.role;
    if (updateUserDto.status) userUpdateData.status = updateUserDto.status;
    if (updateUserDto.emailVerified !== undefined) userUpdateData.emailVerified = updateUserDto.emailVerified;
    if (updateUserDto.phoneVerified !== undefined) userUpdateData.phoneVerified = updateUserDto.phoneVerified;

    if (Object.keys(userUpdateData).length > 0) {
      await this.userModel.update(userUpdateData, { where: { id }, individualHooks: true });
    }

    // Update profile fields
    const profileUpdateData: any = {};
    if (updateUserDto.firstName) profileUpdateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) profileUpdateData.lastName = updateUserDto.lastName;
    if (updateUserDto.dateOfBirth !== undefined) profileUpdateData.dateOfBirth = updateUserDto.dateOfBirth;
    if (updateUserDto.gender !== undefined) profileUpdateData.gender = updateUserDto.gender;

    if (Object.keys(profileUpdateData).length > 0) {
      await this.userProfileModel.update(profileUpdateData, { where: { userId: id } });
    }

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }
    return updatedUser;
  }

  async delete(id: string, requesterRole: UserRole): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedRoles = this.getAllowedRolesForUser(requesterRole);
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    // Prevent deleting super admin
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot delete super admin');
    }

    // Soft delete - update status and use paranoid delete
    await this.userModel.update({ status: UserStatus.DELETED }, { where: { id } });
    await user.destroy();
  }

  async createByAdmin(createUserDto: CreateUserDto, requesterRole: UserRole): Promise<User> {
    // Validate role assignment permissions
    const requestedRole = createUserDto.role || UserRole.PATIENT;

    if (requesterRole !== UserRole.SUPER_ADMIN) {
      // Admin can only create doctors and patients
      if (requesterRole === UserRole.ADMIN) {
        if (![UserRole.DOCTOR, UserRole.PATIENT, UserRole.DELIVERY, UserRole.CATALOG_MANAGER].includes(requestedRole)) {
          throw new ForbiddenException('You can only create doctor, patient, delivery, or catalog manager accounts');
        }
      } else {
        throw new ForbiddenException('You do not have permission to create users');
      }
    }

    return this.create({
      email: createUserDto.email,
      password: createUserDto.password,
      phone: createUserDto.phone,
      role: requestedRole,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : undefined,
      gender: createUserDto.gender,
    });
  }

  async updateProfilePhoto(userId: string, profilePhoto: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userProfileModel.update(
      { profilePhoto },
      { where: { userId } },
    );

    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }
    return updatedUser;
  }

  async updateMedicalRecord(userId: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }

    const currentRecord = user.profile.medicalRecord || { allergies: [], history: [], vaccines: [] };

    const updatedRecord = {
      allergies: updateMedicalRecordDto.allergies ?? currentRecord.allergies,
      history: updateMedicalRecordDto.history ?? currentRecord.history,
      vaccines: updateMedicalRecordDto.vaccines ?? currentRecord.vaccines,
      clinicalNotes: updateMedicalRecordDto.clinicalNotes ?? currentRecord.clinicalNotes,
    };

    await this.userProfileModel.update(
      { medicalRecord: updatedRecord },
      { where: { userId } },
    );

    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }
    return updatedUser;
  }

  async createSkinLog(userId: string, createSkinLogDto: CreateSkinLogDto): Promise<SkinLog> {
    return this.skinLogModel.create({
      userId,
      ...createSkinLogDto,
    });
  }

  async findAllSkinLogs(userId: string): Promise<SkinLog[]> {
    return this.skinLogModel.findAll({
      where: { userId },
      order: [['date', 'DESC']],
    });
  }

  async deleteSkinLog(userId: string, logId: string): Promise<void> {
    const deleted = await this.skinLogModel.destroy({
      where: { id: logId, userId },
    });
    if (deleted === 0) {
      throw new NotFoundException('Skin log not found');
    }
  }
}
