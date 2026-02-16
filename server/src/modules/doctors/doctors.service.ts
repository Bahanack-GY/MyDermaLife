import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Doctor, VerificationStatus, DoctorStatus } from './entities/doctor.entity';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Consultation, ConsultationStatus } from '../consultations/entities/consultation.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';
import { UpdateAvailabilityDto, AvailabilitySlotDto } from './dto/doctor-availability.dto';
import { VerifyDoctorDto } from './dto/verify-doctor.dto';

// Fixed consultation fee in XAF (set by admin/platform)
const CONSULTATION_FEE = 25000;
const VIDEO_CONSULTATION_FEE = 25000;

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor)
    private doctorModel: typeof Doctor,
    @InjectModel(DoctorAvailability)
    private availabilityModel: typeof DoctorAvailability,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Consultation)
    private consultationModel: typeof Consultation,
    private sequelize: Sequelize,
  ) { }

  async create(createDoctorDto: CreateDoctorDto, adminId?: string): Promise<Doctor> {
    // Check if user exists and is a doctor
    const user = await this.userModel.findByPk(createDoctorDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('User must have doctor role to create doctor profile');
    }

    // Check if doctor profile already exists for this user
    const existingDoctor = await this.doctorModel.findOne({
      where: { userId: createDoctorDto.userId },
    });
    if (existingDoctor) {
      throw new ConflictException('Doctor profile already exists for this user');
    }

    // Check license number uniqueness
    const existingLicense = await this.doctorModel.findOne({
      where: { licenseNumber: createDoctorDto.licenseNumber },
    });
    if (existingLicense) {
      throw new ConflictException('License number already registered');
    }

    // Auto-verify when created by admin, use fixed consultation fees
    const doctor = await this.doctorModel.create({
      userId: createDoctorDto.userId,
      licenseNumber: createDoctorDto.licenseNumber,
      specialization: createDoctorDto.specialization,
      yearsOfExperience: createDoctorDto.yearsOfExperience,
      bio: createDoctorDto.bio,
      education: createDoctorDto.education,
      certifications: createDoctorDto.certifications,
      languagesSpoken: createDoctorDto.languagesSpoken,
      consultationFee: CONSULTATION_FEE,
      videoConsultationFee: VIDEO_CONSULTATION_FEE,
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: adminId,
    });

    return this.findById(doctor.id);
  }

  async findAll(
    query: QueryDoctorDto,
  ): Promise<{ data: Doctor[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      specialization,
      verificationStatus,
      status,
      isAvailable,
      language,
      search,
      minFee,
      maxFee,
      minRating,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const whereClause: any = {};

    if (specialization) {
      whereClause.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    if (verificationStatus) {
      whereClause.verificationStatus = verificationStatus;
    }

    if (status) {
      whereClause.status = status;
    }

    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable;
    }

    if (language) {
      whereClause.languagesSpoken = { [Op.contains]: [language] };
    }

    if (minFee !== undefined || maxFee !== undefined) {
      whereClause.consultationFee = {};
      if (minFee !== undefined) {
        whereClause.consultationFee[Op.gte] = minFee;
      }
      if (maxFee !== undefined) {
        whereClause.consultationFee[Op.lte] = maxFee;
      }
    }

    if (minRating !== undefined) {
      whereClause.rating = { [Op.gte]: minRating };
    }

    const includeOptions: any[] = [
      {
        model: User,
        as: 'user',
        include: [UserProfile],
        where: search
          ? {
            [Op.or]: [
              { '$user.profile.first_name$': { [Op.iLike]: `%${search}%` } },
              { '$user.profile.last_name$': { [Op.iLike]: `%${search}%` } },
            ],
          }
          : undefined,
      },
      {
        model: DoctorAvailability,
        as: 'availability',
        required: false,
      },
    ];

    const offset = (page - 1) * limit;

    // Map sortBy to actual database column names
    const sortColumn = this.getSortColumn(sortBy);

    const { rows, count } = await this.doctorModel.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [[Sequelize.col(`Doctor.${sortColumn}`), sortOrder]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          include: [UserProfile],
        },
        {
          model: DoctorAvailability,
          as: 'availability',
        },
      ],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorModel.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          include: [UserProfile],
        },
        {
          model: DoctorAvailability,
          as: 'availability',
        },
      ],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }

    return doctor;
  }

  async update(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<Doctor> {
    const doctor = await this.findById(id);

    // Check permissions: only the doctor themselves or admins can update
    if (requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      if (doctor.userId !== requesterId) {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    // Check license uniqueness if being updated
    if (updateDoctorDto.licenseNumber && updateDoctorDto.licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await this.doctorModel.findOne({
        where: { licenseNumber: updateDoctorDto.licenseNumber },
      });
      if (existingLicense) {
        throw new ConflictException('License number already registered');
      }
    }

    // Doctors cannot change their own status (only admins can)
    if (updateDoctorDto.status && requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      delete updateDoctorDto.status;
    }

    await doctor.update(updateDoctorDto);

    return this.findById(id);
  }

  async delete(id: string, requesterRole: UserRole): Promise<void> {
    if (requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete doctor profiles');
    }

    const doctor = await this.findById(id);
    await doctor.destroy();
  }

  async verify(
    id: string,
    verifyDto: VerifyDoctorDto,
    verifierId: string,
    requesterRole: UserRole,
  ): Promise<Doctor> {
    if (requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can verify doctors');
    }

    const doctor = await this.findById(id);

    await doctor.update({
      verificationStatus: verifyDto.status as VerificationStatus,
      verifiedAt: new Date(),
      verifiedBy: verifierId,
    });

    return this.findById(id);
  }

  async getAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    await this.findById(doctorId); // Verify doctor exists

    return this.availabilityModel.findAll({
      where: { doctorId },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
    });
  }

  async updateAvailability(
    doctorId: string,
    updateDto: UpdateAvailabilityDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<DoctorAvailability[]> {
    const doctor = await this.findById(doctorId);

    // Check permissions
    if (requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      if (doctor.userId !== requesterId) {
        throw new ForbiddenException('You can only update your own availability');
      }
    }

    // Validate time slots
    for (const slot of updateDto.slots) {
      if (slot.startTime >= slot.endTime) {
        throw new ConflictException(`Invalid time slot: start time must be before end time (day ${slot.dayOfWeek})`);
      }
    }

    // Delete existing availability and recreate inside a transaction
    await this.sequelize.transaction(async (transaction) => {
      await this.availabilityModel.destroy({ where: { doctorId }, transaction });

      const availabilityRecords = updateDto.slots.map((slot) => ({
        doctorId,
        dayOfWeek: slot.dayOfWeek,
        date: slot.date || null,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable ?? true,
      }));

      await this.availabilityModel.bulkCreate(availabilityRecords, { transaction });
    });

    return this.getAvailability(doctorId);
  }

  async addAvailabilitySlot(
    doctorId: string,
    slot: AvailabilitySlotDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<DoctorAvailability> {
    const doctor = await this.findById(doctorId);

    // Check permissions
    if (requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      if (doctor.userId !== requesterId) {
        throw new ForbiddenException('You can only update your own availability');
      }
    }

    if (slot.startTime >= slot.endTime) {
      throw new ConflictException('Invalid time slot: start time must be before end time');
    }

    return this.availabilityModel.create({
      doctorId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable ?? true,
    });
  }

  async removeAvailabilitySlot(
    doctorId: string,
    slotId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    const doctor = await this.findById(doctorId);

    // Check permissions
    if (requesterRole !== UserRole.SUPER_ADMIN && requesterRole !== UserRole.ADMIN) {
      if (doctor.userId !== requesterId) {
        throw new ForbiddenException('You can only update your own availability');
      }
    }

    const slot = await this.availabilityModel.findOne({
      where: { id: slotId, doctorId },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    // Check if there are any future consultations that rely on this slot
    const now = new Date();
    const futureConsultations = await this.consultationModel.findAll({
      where: {
        doctorId,
        scheduledDate: { [Op.gte]: now },
        status: {
          [Op.in]: [
            ConsultationStatus.PROPOSED,
            ConsultationStatus.SCHEDULED,
            ConsultationStatus.IN_PROGRESS
          ]
        }
      }
    });

    const hasConflict = futureConsultations.some(c => {
      const cDate = new Date(c.scheduledDate);

      // If slot is specific date, check exact match
      if (slot.date) {
        const cDateStr = cDate.toISOString().split('T')[0];
        return cDateStr === slot.date;
      } else {
        // If slot is recurring, check day of week match
        if (cDate.getDay() === slot.dayOfWeek) {
          // Check time overlap
          const cTime = cDate.getHours() * 60 + cDate.getMinutes();
          const [startH, startM] = slot.startTime.split(':').map(Number);
          const [endH, endM] = slot.endTime.split(':').map(Number);
          const slotStart = startH * 60 + startM;
          const slotEnd = endH * 60 + endM;

          return cTime >= slotStart && cTime < slotEnd;
        }
      }
      return false;
    });

    if (hasConflict) {
      throw new ConflictException('Cannot delete availability slot because there are upcoming consultations scheduled during this time.');
    }

    await slot.destroy();
  }

  private getSortColumn(sortBy: string): string {
    const sortMap: Record<string, string> = {
      rating: 'rating',
      consultationFee: 'consultation_fee',
      yearsOfExperience: 'years_of_experience',
      totalReviews: 'total_reviews',
      totalConsultations: 'total_consultations',
      createdAt: 'created_at',
    };
    return sortMap[sortBy] || 'created_at';
  }

  async getBookedSlots(doctorId: string, date: string | Date): Promise<string[]> {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const consultations = await this.consultationModel.findAll({
      where: {
        doctorId,
        scheduledDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
        status: {
          [Op.in]: [
            ConsultationStatus.PROPOSED,
            ConsultationStatus.SCHEDULED,
            ConsultationStatus.IN_PROGRESS,
            ConsultationStatus.COMPLETED,
          ],
        },
      },
    });

    return consultations.map(c => {
      const d = new Date(c.scheduledDate);
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    });
  }
}
