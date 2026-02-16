import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { MedicalDocument } from '../patients/entities/medical-document.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(ProductImage)
    private readonly productImageModel: typeof ProductImage,
    @InjectModel(ProductCategory)
    private readonly categoryModel: typeof ProductCategory,
    @InjectModel(MedicalDocument)
    private readonly medicalDocumentModel: typeof MedicalDocument,
  ) { }

  async saveProductImage(
    productId: string,
    file: Express.Multer.File,
    altText?: string,
    isPrimary?: boolean,
    sortOrder?: number,
  ): Promise<ProductImage> {
    const imageUrl = `/uploads/products/${file.filename}`;

    const image = await this.productImageModel.create({
      productId,
      imageUrl,
      altText: altText || null,
      isPrimary: isPrimary ?? false,
      sortOrder: sortOrder ?? 0,
    });

    return image;
  }

  async deleteProductImage(imageId: string): Promise<void> {
    const image = await this.productImageModel.findByPk(imageId);
    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    this.removeFileFromDisk(image.imageUrl);
    await image.destroy();
  }

  async saveCategoryImage(
    categoryId: string,
    file: Express.Multer.File,
  ): Promise<ProductCategory> {
    const category = await this.categoryModel.findByPk(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Delete old image if exists
    if (category.imageUrl) {
      this.removeFileFromDisk(category.imageUrl);
    }

    const imageUrl = `/uploads/categories/${file.filename}`;
    await category.update({ imageUrl });

    return category;
  }

  async deleteCategoryImage(categoryId: string): Promise<ProductCategory> {
    const category = await this.categoryModel.findByPk(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.imageUrl) {
      throw new BadRequestException('Category has no image');
    }

    this.removeFileFromDisk(category.imageUrl);
    await category.update({ imageUrl: null });

    return category;
  }

  async saveMedicalDocument(
    patientId: string,
    doctorId: string,
    file: Express.Multer.File,
    data: { category: string; title: string; description?: string; metadata?: any; date?: string },
  ): Promise<MedicalDocument> {
    const fileUrl = `/uploads/medical-documents/${file.filename}`;

    const document = await this.medicalDocumentModel.create({
      patientId,
      doctorId,
      category: data.category,
      title: data.title,
      description: data.description,
      fileUrl,
      metadata: data.metadata,
      date: data.date || new Date(),
    });

    return document;
  }

  async deleteMedicalDocument(documentId: string): Promise<void> {
    const document = await this.medicalDocumentModel.findByPk(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    this.removeFileFromDisk(document.fileUrl);
    await document.destroy();
  }

  private removeFileFromDisk(imageUrl: string): void {
    const filePath = path.join(process.cwd(), imageUrl);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // File may already be deleted, ignore
    }
  }
}
