import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseStock } from './entities/warehouse-stock.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { QueryWarehouseDto } from './dto/query-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
    @InjectModel(WarehouseStock)
    private warehouseStockModel: typeof WarehouseStock,
  ) {}

  async findAll(query: QueryWarehouseDto) {
    const { country, isActive, page = 1, limit = 10 } = query;
    const where: any = {};

    if (country) where.country = country;
    if (isActive !== undefined) where.isActive = isActive;

    const { rows: data, count: total } =
      await this.warehouseModel.findAndCountAll({
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
    const warehouse = await this.warehouseModel.findByPk(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const stockSummary = await this.warehouseStockModel.findAll({
      where: { warehouseId: id },
      attributes: [
        [fn('COUNT', col('product_id')), 'productCount'],
        [fn('SUM', col('quantity')), 'totalItems'],
      ],
      raw: true,
    });

    return {
      ...warehouse.toJSON(),
      stockSummary: {
        productCount: Number(stockSummary[0]?.['productCount'] || 0),
        totalItems: Number(stockSummary[0]?.['totalItems'] || 0),
      },
    };
  }

  async create(dto: CreateWarehouseDto, userId: string) {
    const existing = await this.warehouseModel.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Warehouse with code '${dto.code}' already exists`,
      );
    }

    return this.warehouseModel.create({ ...dto } as any);
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.warehouseModel.findByPk(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (dto.code && dto.code !== warehouse.code) {
      const existing = await this.warehouseModel.findOne({
        where: { code: dto.code, id: { [Op.ne]: id } },
      });
      if (existing) {
        throw new ConflictException(
          `Warehouse with code '${dto.code}' already exists`,
        );
      }
    }

    await warehouse.update(dto);
    return warehouse;
  }

  async delete(id: string) {
    const warehouse = await this.warehouseModel.findByPk(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const stockCount = await this.warehouseStockModel.count({
      where: {
        warehouseId: id,
        quantity: { [Op.gt]: 0 },
      },
    });

    if (stockCount > 0) {
      throw new BadRequestException(
        'Cannot delete warehouse with existing stock. Transfer or adjust stock to zero first.',
      );
    }

    await warehouse.destroy();
    return { message: 'Warehouse deleted successfully' };
  }
}
