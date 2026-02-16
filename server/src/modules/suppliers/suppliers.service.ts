import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Supplier } from './entities/supplier.entity';
import { SupplierProduct } from './entities/supplier-product.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { CreateSupplierProductDto } from './dto/create-supplier-product.dto';
import { UpdateSupplierProductDto } from './dto/update-supplier-product.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier)
    private supplierModel: typeof Supplier,
    @InjectModel(SupplierProduct)
    private supplierProductModel: typeof SupplierProduct,
  ) {}

  async findAll(query: QuerySupplierDto) {
    const { search, country, isActive, page = 1, limit = 10 } = query;
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { contactPerson: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (country) where.country = country;
    if (isActive !== undefined) where.isActive = isActive;

    const { rows: data, count: total } =
      await this.supplierModel.findAndCountAll({
        where,
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const supplier = await this.supplierModel.findByPk(id, {
      include: [
        {
          model: SupplierProduct,
          as: 'products',
          include: [{ model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'slug'] }],
        },
      ],
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto, userId: string) {
    const existing = await this.supplierModel.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Supplier with code '${dto.code}' already exists`);
    }

    return this.supplierModel.create({ ...dto, createdBy: userId } as any);
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const supplier = await this.supplierModel.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (dto.code && dto.code !== supplier.code) {
      const existing = await this.supplierModel.findOne({
        where: { code: dto.code, id: { [Op.ne]: id } },
      });
      if (existing) {
        throw new ConflictException(`Supplier with code '${dto.code}' already exists`);
      }
    }

    await supplier.update(dto);
    return supplier;
  }

  async delete(id: string) {
    const supplier = await this.supplierModel.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    await supplier.destroy();
    return { message: 'Supplier deleted successfully' };
  }

  // Supplier-Product link management
  async getSupplierProducts(supplierId: string) {
    const supplier = await this.supplierModel.findByPk(supplierId);
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.supplierProductModel.findAll({
      where: { supplierId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'slug', 'price'] }],
    });
  }

  async linkProduct(supplierId: string, dto: CreateSupplierProductDto) {
    const supplier = await this.supplierModel.findByPk(supplierId);
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const existing = await this.supplierProductModel.findOne({
      where: { supplierId, productId: dto.productId },
    });
    if (existing) {
      throw new ConflictException('Product already linked to this supplier');
    }

    return this.supplierProductModel.create({
      supplierId,
      ...dto,
    } as any);
  }

  async updateProductLink(supplierId: string, productId: string, dto: UpdateSupplierProductDto) {
    const link = await this.supplierProductModel.findOne({
      where: { supplierId, productId },
    });
    if (!link) {
      throw new NotFoundException('Supplier-product link not found');
    }

    await link.update(dto);
    return link;
  }

  async removeProductLink(supplierId: string, productId: string) {
    const link = await this.supplierProductModel.findOne({
      where: { supplierId, productId },
    });
    if (!link) {
      throw new NotFoundException('Supplier-product link not found');
    }

    await link.destroy();
    return { message: 'Product link removed successfully' };
  }
}
