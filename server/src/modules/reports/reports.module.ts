import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Consultation } from '../consultations/entities/consultation.entity';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Consultation]),
        DoctorsModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
