import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Routine, RoutineProduct } from './entities';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Routine, RoutineProduct]),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService, SequelizeModule],
})
export class RoutinesModule {}
