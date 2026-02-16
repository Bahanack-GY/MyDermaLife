import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Doctor, DoctorAvailability } from './entities';
import { Consultation } from '../consultations/entities/consultation.entity';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Doctor, DoctorAvailability, User, UserProfile, Consultation]),
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService, SequelizeModule],
})
export class DoctorsModule { }
