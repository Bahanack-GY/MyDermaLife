import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ConsultationsModule } from '../consultations/consultations.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
    imports: [ConsultationsModule, DoctorsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
