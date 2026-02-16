import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Includeable } from 'sequelize';
import { Routine } from './entities/routine.entity';
import { RoutineProduct } from './entities/routine-product.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { CreateRoutineDto, RoutineProductItemDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { QueryRoutineDto } from './dto/query-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectModel(Routine)
    private routineModel: typeof Routine,
    @InjectModel(RoutineProduct)
    private routineProductModel: typeof RoutineProduct,
  ) {}

  private get productsInclude(): Includeable {
    return {
      model: RoutineProduct,
      as: 'products',
      attributes: ['id', 'stepOrder', 'stepLabel', 'productId'],
      separate: true,
      order: [['step_order', 'ASC']] as any,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'imageUrl'],
              where: { isPrimary: true },
              required: false,
            },
          ],
        },
      ],
    };
  }

  async findAll(
    query: QueryRoutineDto,
  ): Promise<{ data: Routine[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const sortColumn = sortBy === 'name' ? 'name' : 'created_at';

    const { rows, count } = await this.routineModel.findAndCountAll({
      where,
      include: [this.productsInclude],
      order: [[sortColumn, sortOrder]],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: string): Promise<Routine> {
    const routine = await this.routineModel.findByPk(id, {
      include: [this.productsInclude],
    });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    return routine;
  }

  async findBySlug(slug: string): Promise<Routine> {
    const routine = await this.routineModel.findOne({
      where: { slug, isActive: true },
      include: [this.productsInclude],
    });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    return routine;
  }

  async create(dto: CreateRoutineDto, adminId: string): Promise<Routine> {
    const existingSlug = await this.routineModel.findOne({
      where: { slug: dto.slug },
      paranoid: false,
    });
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const { items, ...routineData } = dto;

    const routine = await this.routineModel.create({
      ...routineData,
      createdBy: adminId,
    });

    if (items && items.length > 0) {
      await this.routineProductModel.bulkCreate(
        items.map((item) => ({
          routineId: routine.id,
          productId: item.productId,
          stepOrder: item.stepOrder,
          stepLabel: item.stepLabel,
        })),
      );
    }

    return this.findById(routine.id);
  }

  async update(id: string, dto: UpdateRoutineDto): Promise<Routine> {
    const routine = await this.findById(id);

    if (dto.slug && dto.slug !== routine.slug) {
      const existingSlug = await this.routineModel.findOne({
        where: { slug: dto.slug, id: { [Op.ne]: id } },
        paranoid: false,
      });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    const { items, ...routineData } = dto;
    await routine.update(routineData);

    if (items !== undefined) {
      await this.routineProductModel.destroy({ where: { routineId: id } });
      if (items.length > 0) {
        await this.routineProductModel.bulkCreate(
          items.map((item) => ({
            routineId: id,
            productId: item.productId,
            stepOrder: item.stepOrder,
            stepLabel: item.stepLabel,
          })),
        );
      }
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const routine = await this.findById(id);
    const suffix = `_deleted_${Date.now()}`;
    await routine.update({ slug: routine.slug + suffix });
    await routine.destroy();
  }

  async setProducts(routineId: string, items: RoutineProductItemDto[]): Promise<Routine> {
    const routine = await this.findById(routineId);

    await this.routineProductModel.destroy({ where: { routineId: routine.id } });

    if (items.length > 0) {
      await this.routineProductModel.bulkCreate(
        items.map((item) => ({
          routineId: routine.id,
          productId: item.productId,
          stepOrder: item.stepOrder,
          stepLabel: item.stepLabel,
        })),
      );
    }

    return this.findById(routine.id);
  }

  async addProduct(routineId: string, item: RoutineProductItemDto): Promise<Routine> {
    const routine = await this.findById(routineId);

    const existing = await this.routineProductModel.findOne({
      where: { routineId: routine.id, productId: item.productId },
    });
    if (existing) {
      throw new ConflictException('Product already in this routine');
    }

    await this.routineProductModel.create({
      routineId: routine.id,
      productId: item.productId,
      stepOrder: item.stepOrder,
      stepLabel: item.stepLabel,
    });

    return this.findById(routine.id);
  }

  async removeProduct(routineId: string, productId: string): Promise<Routine> {
    const routine = await this.findById(routineId);

    const item = await this.routineProductModel.findOne({
      where: { routineId: routine.id, productId },
    });
    if (!item) {
      throw new NotFoundException('Product not found in this routine');
    }

    await item.destroy();

    return this.findById(routine.id);
  }

  async findByProductId(productId: string): Promise<Routine[]> {
    const routineIds = await this.routineProductModel.findAll({
      where: { productId },
      attributes: ['routineId'],
    });

    if (routineIds.length === 0) return [];

    const ids = routineIds.map((rp) => rp.routineId);

    return this.routineModel.findAll({
      where: { id: { [Op.in]: ids }, isActive: true },
      include: [this.productsInclude],
      order: [['created_at', 'DESC']],
    });
  }
}
