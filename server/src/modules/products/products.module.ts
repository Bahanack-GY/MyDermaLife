import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product, ProductCategory, ProductImage, SearchLog, ProductReview } from './entities';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories.service';
import { ReviewsService } from './reviews.service';
import { ProductsController } from './products.controller';
import { CategoriesController } from './categories.controller';
import { ReviewsController } from './reviews.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { RoutinesModule } from '../routines/routines.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, ProductCategory, ProductImage, SearchLog, ProductReview]),
    UploadsModule,
    RoutinesModule,
  ],
  controllers: [ProductsController, CategoriesController, ReviewsController],
  providers: [ProductsService, CategoriesService, ReviewsService],
  exports: [ProductsService, CategoriesService, ReviewsService, SequelizeModule],
})
export class ProductsModule {}
