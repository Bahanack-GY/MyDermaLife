import {
  Controller,
  Get,
  Post,
  Put,
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
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';
import {
  UpdateAvailabilityDto,
  AvailabilitySlotDto,
  AvailabilityResponseDto,
} from './dto/doctor-availability.dto';
import { DoctorResponseDto, PaginatedDoctorsResponseDto } from './dto/doctor-response.dto';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@ApiTags('Doctors')
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  // ==================== LIST ENDPOINTS ====================

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all doctors', description: 'Public endpoint to list all doctors' })
  @ApiResponse({ status: 200, description: 'List of doctors', type: PaginatedDoctorsResponseDto })
  async findAll(@Query() query: QueryDoctorDto): Promise<PaginatedDoctorsResponseDto> {
    const result = await this.doctorsService.findAll(query);
    return {
      data: result.data.map((doctor) => this.formatDoctorResponse(doctor)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ==================== "ME" ENDPOINTS (must be before :id routes) ====================

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get current doctor profile', description: 'Get the authenticated doctor\'s profile' })
  @ApiResponse({ status: 200, description: 'Doctor profile', type: DoctorResponseDto })
  @ApiResponse({ status: 404, description: 'Doctor profile not found' })
  async getMyProfile(@CurrentUser() currentUser: any): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.findByUserId(currentUser.id);
    return this.formatDoctorResponse(doctor);
  }

  @Put('me')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update own doctor profile', description: 'Doctor can update their own profile' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: DoctorResponseDto })
  async updateMyProfile(
    @Body() updateDoctorDto: UpdateDoctorDto,
    @CurrentUser() currentUser: any,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.findByUserId(currentUser.id);
    const updated = await this.doctorsService.update(
      doctor.id,
      updateDoctorDto,
      currentUser.id,
      currentUser.role,
    );
    return this.formatDoctorResponse(updated);
  }

  @Get('me/availability')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get own availability', description: 'Get the authenticated doctor\'s availability' })
  @ApiResponse({ status: 200, description: 'Availability slots', type: [AvailabilityResponseDto] })
  async getMyAvailability(@CurrentUser() currentUser: any): Promise<AvailabilityResponseDto[]> {
    const doctor = await this.doctorsService.findByUserId(currentUser.id);
    const availability = await this.doctorsService.getAvailability(doctor.id);
    return availability.map((slot) => this.formatAvailabilityResponse(slot));
  }

  @Put('me/availability')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update own availability', description: 'Doctor updates their own availability' })
  @ApiResponse({ status: 200, description: 'Availability updated', type: [AvailabilityResponseDto] })
  async updateMyAvailability(
    @Body() updateDto: UpdateAvailabilityDto,
    @CurrentUser() currentUser: any,
  ): Promise<AvailabilityResponseDto[]> {
    const doctor = await this.doctorsService.findByUserId(currentUser.id);
    const availability = await this.doctorsService.updateAvailability(
      doctor.id,
      updateDto,
      currentUser.id,
      currentUser.role,
    );
    return availability.map((slot) => this.formatAvailabilityResponse(slot));
  }

  @Delete('me/availability/:slotId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Delete own availability slot', description: 'Doctor deletes one of their availability slots' })
  @ApiParam({ name: 'slotId', description: 'Availability slot UUID' })
  @ApiResponse({ status: 200, description: 'Slot removed' })
  async deleteMyAvailabilitySlot(
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    const doctor = await this.doctorsService.findByUserId(currentUser.id);
    await this.doctorsService.removeAvailabilitySlot(
      doctor.id,
      slotId,
      currentUser.id,
      currentUser.role,
    );
    return { message: 'Availability slot removed successfully' };
  }

  // ==================== CREATE ENDPOINT ====================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create doctor profile', description: 'Admin only: Create a doctor profile for a user (auto-verified)' })
  @ApiResponse({ status: 201, description: 'Doctor profile created', type: DoctorResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Doctor profile already exists or license number taken' })
  async create(
    @Body() createDoctorDto: CreateDoctorDto,
    @CurrentUser() currentUser: any,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.create(createDoctorDto, currentUser.id);
    return this.formatDoctorResponse(doctor);
  }

  // ==================== PARAMETERIZED ENDPOINTS ====================

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get doctor by ID', description: 'Public endpoint to get doctor details' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 200, description: 'Doctor found', type: DoctorResponseDto })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.findById(id);
    return this.formatDoctorResponse(doctor);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update doctor profile', description: 'Update a doctor\'s profile (admins or self)' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 200, description: 'Doctor updated', type: DoctorResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @CurrentUser() currentUser: any,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.update(
      id,
      updateDoctorDto,
      currentUser.id,
      currentUser.role,
    );
    return this.formatDoctorResponse(doctor);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete doctor profile', description: 'Admin only: Soft delete a doctor profile' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 200, description: 'Doctor deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    await this.doctorsService.delete(id, currentUser.role);
    return { message: 'Doctor profile deleted successfully' };
  }

  // ==================== AVAILABILITY ENDPOINTS ====================

  @Get(':id/booked-slots')
  @Public()
  @ApiOperation({ summary: 'Get booked slots', description: 'Public endpoint to get booked time slots for a specific date' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 200, description: 'List of booked time slots', type: [String] })
  async getBookedSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date: string,
  ): Promise<string[]> {
    return this.doctorsService.getBookedSlots(id, date);
  }

  @Get(':id/availability')
  @Public()
  @ApiOperation({ summary: 'Get doctor availability', description: 'Public endpoint to get doctor\'s weekly schedule' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 200, description: 'Doctor availability', type: [AvailabilityResponseDto] })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getAvailability(@Param('id', ParseUUIDPipe) id: string): Promise<AvailabilityResponseDto[]> {
    const availability = await this.doctorsService.getAvailability(id);
    return availability.map((slot) => this.formatAvailabilityResponse(slot));
  }

  @Put(':id/availability')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update doctor availability', description: 'Replace all availability slots' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 200, description: 'Availability updated', type: [AvailabilityResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async updateAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAvailabilityDto,
    @CurrentUser() currentUser: any,
  ): Promise<AvailabilityResponseDto[]> {
    const availability = await this.doctorsService.updateAvailability(
      id,
      updateDto,
      currentUser.id,
      currentUser.role,
    );
    return availability.map((slot) => this.formatAvailabilityResponse(slot));
  }

  @Post(':id/availability/slot')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Add availability slot', description: 'Add a single availability slot' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiResponse({ status: 201, description: 'Slot added', type: AvailabilityResponseDto })
  async addAvailabilitySlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() slot: AvailabilitySlotDto,
    @CurrentUser() currentUser: any,
  ): Promise<AvailabilityResponseDto> {
    const availability = await this.doctorsService.addAvailabilitySlot(
      id,
      slot,
      currentUser.id,
      currentUser.role,
    );
    return this.formatAvailabilityResponse(availability);
  }

  @Delete(':id/availability/:slotId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Remove availability slot', description: 'Remove a single availability slot' })
  @ApiParam({ name: 'id', description: 'Doctor UUID' })
  @ApiParam({ name: 'slotId', description: 'Availability slot UUID' })
  @ApiResponse({ status: 200, description: 'Slot removed' })
  async removeAvailabilitySlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    await this.doctorsService.removeAvailabilitySlot(
      id,
      slotId,
      currentUser.id,
      currentUser.role,
    );
    return { message: 'Availability slot removed successfully' };
  }

  // ==================== HELPERS ====================

  private formatDoctorResponse(doctor: any): DoctorResponseDto {
    return {
      id: doctor.id,
      userId: doctor.userId,
      licenseNumber: doctor.licenseNumber,
      specialization: doctor.specialization,
      yearsOfExperience: doctor.yearsOfExperience,
      bio: doctor.bio,
      education: doctor.education,
      certifications: doctor.certifications,
      languagesSpoken: doctor.languagesSpoken,
      consultationFee: doctor.consultationFee ? parseFloat(doctor.consultationFee) : undefined,
      videoConsultationFee: doctor.videoConsultationFee ? parseFloat(doctor.videoConsultationFee) : undefined,
      rating: doctor.rating ? parseFloat(doctor.rating) : 0,
      totalReviews: doctor.totalReviews,
      totalConsultations: doctor.totalConsultations,
      verificationStatus: doctor.verificationStatus,
      verifiedAt: doctor.verifiedAt,
      isAvailable: doctor.isAvailable,
      status: doctor.status,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
      user: doctor.user
        ? {
          id: doctor.user.id,
          email: doctor.user.email,
          phone: doctor.user.phone,
          profile: doctor.user.profile
            ? {
              firstName: doctor.user.profile.firstName,
              lastName: doctor.user.profile.lastName,
              profilePhoto: doctor.user.profile.profilePhoto,
              gender: doctor.user.profile.gender,
              city: doctor.user.profile.city,
              country: doctor.user.profile.country,
            }
            : undefined,
        }
        : undefined,
      availability: doctor.availability
        ? doctor.availability.map((slot: any) => this.formatAvailabilityResponse(slot))
        : undefined,
    };
  }

  private formatAvailabilityResponse(slot: any): AvailabilityResponseDto {
    return {
      id: slot.id,
      doctorId: slot.doctorId,
      dayOfWeek: slot.dayOfWeek,
      date: slot.date,
      dayName: DAY_NAMES[slot.dayOfWeek],
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    };
  }
}
