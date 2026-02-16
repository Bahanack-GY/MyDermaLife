import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { Consultation } from './entities/consultation.entity';
import { DoctorsModule } from '../doctors/doctors.module';
import { SignalingModule } from '../signaling/signaling.module';

import { PatientConsultationsController } from './patient-consultations.controller';

@Module({
    imports: [
        SequelizeModule.forFeature([Consultation]),
        DoctorsModule,
        SignalingModule,
    ],
    controllers: [ConsultationsController, PatientConsultationsController],
    providers: [ConsultationsService],
    exports: [ConsultationsService],
})
export class ConsultationsModule { }
