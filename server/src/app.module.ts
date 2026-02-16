import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './common/interceptors';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SignalingModule } from './modules/signaling/signaling.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { RoutinesModule } from './modules/routines/routines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get('NODE_ENV') !== 'production' ? 'debug' : 'info',
        transports: [
          new winston.transports.Console({
            format:
              configService.get('NODE_ENV') !== 'production'
                ? winston.format.combine(
                  winston.format.timestamp(),
                  winston.format.colorize(),
                  winston.format.simple(),
                )
                : winston.format.combine(
                  winston.format.timestamp(),
                  winston.format.json(),
                ),
          }),
        ],
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        uri: configService.get<string>('DATABASE_URL'),
        autoLoadModels: true,
        synchronize: false,
        alter: false,
        logging: process.env.NODE_ENV !== 'production' ? console.log : false,
      }),
    }),
    UsersModule,
    AuthModule,
    DoctorsModule,
    ConsultationsModule,
    DashboardModule,
    PatientsModule,
    SignalingModule,
    PrescriptionsModule,
    ProductsModule,
    InventoryModule,
    SuppliersModule,
    UploadsModule,
    CartModule,
    OrdersModule,
    ReportsModule,
    DeliveriesModule,
    RoutinesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
