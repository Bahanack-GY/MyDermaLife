import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { UsersModule } from '../users/users.module';
import { ConsultationsModule } from '../consultations/consultations.module';
import { DoctorsModule } from '../doctors/doctors.module';

import { MedicalDocument } from './entities/medical-document.entity';
import { SequelizeModule } from '@nestjs/sequelize';

import { UploadsModule } from '../uploads/uploads.module';

@Module({
    imports: [
        SequelizeModule.forFeature([MedicalDocument]),
        UsersModule,
        ConsultationsModule,
        DoctorsModule,
        UploadsModule
    ],
    controllers: [PatientsController],
    providers: [PatientsService],
})
export class PatientsModule { }
