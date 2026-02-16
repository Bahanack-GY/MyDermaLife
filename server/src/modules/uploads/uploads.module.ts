import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UploadsService } from './uploads.service';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { MedicalDocument } from '../patients/entities/medical-document.entity';

@Module({
  imports: [SequelizeModule.forFeature([ProductImage, ProductCategory, MedicalDocument])],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule { }
