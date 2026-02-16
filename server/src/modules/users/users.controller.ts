import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfilePhotoDto } from './dto/update-profile-photo.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateSkinLogDto } from './dto/create-skin-log.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto, PaginatedUsersResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Super Admin: all users | Admin: doctors & patients | Doctor: patients only',
  })
  @ApiResponse({ status: 200, description: 'List of users', type: PaginatedUsersResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(
    @Query() query: QueryUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.usersService.findAll(query, currentUser.role);
    return {
      data: result.data.map((user) => this.formatUserResponse(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Get a single user. Access depends on requester role.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id, currentUser.role);
    return this.formatUserResponse(user);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Super Admin: can create any role | Admin: can create doctors & patients',
  })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.createByAdmin(createUserDto, currentUser.role);
    return this.formatUserResponse(user);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user details. Role changes only by Super Admin.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto, currentUser.role);
    return this.formatUserResponse(user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete user (soft delete)',
    description: 'Soft delete a user. Cannot delete super admins.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    await this.usersService.delete(id, currentUser.role);
    return { message: 'User deleted successfully' };
  }

  @Patch('profile/photo')
  @ApiOperation({
    summary: 'Update profile photo',
    description: 'Update the authenticated user\'s profile photo with a base64 encoded image',
  })
  @ApiResponse({ status: 200, description: 'Profile photo updated', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid base64 image format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfilePhoto(
    @Body() updateProfilePhotoDto: UpdateProfilePhotoDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateProfilePhoto(
      currentUser.id,
      updateProfilePhotoDto.profilePhoto,
    );
    return this.formatUserResponse(user);
  }

  @Patch('profile/medical-record')
  @ApiOperation({
    summary: 'Update medical record',
    description: 'Update the authenticated user\'s allergies, medical history, and vaccines',
  })
  @ApiResponse({ status: 200, description: 'Medical record updated', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateMedicalRecord(
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateMedicalRecord(
      currentUser.sub,
      updateMedicalRecordDto,
    );
    return this.formatUserResponse(user);
  }

  @Post('profile/skin-logs')
  @ApiOperation({ summary: 'Add a new skin log entry' })
  @ApiResponse({ status: 201, description: 'Skin log entry added' })
  async createSkinLog(
    @Body() createSkinLogDto: CreateSkinLogDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.createSkinLog(currentUser.id, createSkinLogDto);
  }

  @Get('profile/skin-logs')
  @ApiOperation({ summary: 'Get all skin log entries' })
  @ApiResponse({ status: 200, description: 'List of skin log entries' })
  async getSkinLogs(@CurrentUser() currentUser: any) {
    return this.usersService.findAllSkinLogs(currentUser.id);
  }

  @Delete('profile/skin-logs/:id')
  @ApiOperation({ summary: 'Delete a skin log entry' })
  @ApiResponse({ status: 200, description: 'Skin log entry deleted' })
  async deleteSkinLog(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.deleteSkinLog(currentUser.id, id);
  }

  // Role-specific endpoints for convenience

  @Get('role/doctors')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({ status: 200, description: 'List of doctors', type: PaginatedUsersResponseDto })
  async findDoctors(
    @Query() query: QueryUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.usersService.findAll(
      { ...query, role: UserRole.DOCTOR },
      currentUser.role,
    );
    return {
      data: result.data.map((user) => this.formatUserResponse(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('role/patients')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'List of patients', type: PaginatedUsersResponseDto })
  async findPatients(
    @Query() query: QueryUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.usersService.findAll(
      { ...query, role: UserRole.PATIENT },
      currentUser.role,
    );
    return {
      data: result.data.map((user) => this.formatUserResponse(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('role/admins')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all admins (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'List of admins', type: PaginatedUsersResponseDto })
  async findAdmins(
    @Query() query: QueryUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.usersService.findAll(
      { ...query, role: UserRole.ADMIN },
      currentUser.role,
    );
    return {
      data: result.data.map((user) => this.formatUserResponse(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private formatUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
          id: user.profile.id,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          dateOfBirth: user.profile.dateOfBirth,
          gender: user.profile.gender,
          profilePhoto: user.profile.profilePhoto,
          language: user.profile.language,
          country: user.profile.country,
          city: user.profile.city,
        }
        : undefined,
    };
  }
}
