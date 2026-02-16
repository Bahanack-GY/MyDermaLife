import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ProductCategory } from './entities/product-category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(ProductCategory)
    private categoryModel: typeof ProductCategory,
  ) {}

  async findAll(): Promise<ProductCategory[]> {
    return this.categoryModel.findAll({
      where: { parentCategoryId: null, isActive: true },
      include: [
        {
          model: ProductCategory,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        [{ model: ProductCategory, as: 'subcategories' }, 'sortOrder', 'ASC'],
      ],
    });
  }

  async findById(id: string): Promise<ProductCategory> {
    const category = await this.categoryModel.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Product,
              as: 'products',
              where: { isActive: true, deletedAt: null },
              required: false,
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['id', 'imageUrl', 'altText', 'sortOrder', 'isPrimary'],
                },
              ],
            },
          ],
        },
        {
          model: Product,
          as: 'products',
          where: { isActive: true, deletedAt: null },
          required: false,
          include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'imageUrl', 'altText', 'sortOrder', 'isPrimary'],
            },
          ],
        },
      ],
      order: [
        [{ model: ProductCategory, as: 'subcategories' }, 'sortOrder', 'ASC'],
      ],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findProductsByCategory(id: string): Promise<Product[]> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const isParent = category.parentCategoryId === null;

    if (isParent) {
      const subcategories = await this.categoryModel.findAll({
        where: { parentCategoryId: id, isActive: true },
        attributes: ['id'],
      });
      const subcategoryIds = subcategories.map((sub) => sub.id);
      const categoryIds = [id, ...subcategoryIds];

      return Product.findAll({
        where: { categoryId: { [Op.in]: categoryIds }, isActive: true, deletedAt: null },
        include: [
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'imageUrl', 'altText', 'sortOrder', 'isPrimary'],
          },
          {
            model: ProductCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    }

    return Product.findAll({
      where: { categoryId: id, isActive: true, deletedAt: null },
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'sortOrder', 'isPrimary'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async create(dto: CreateCategoryDto): Promise<ProductCategory> {
    const existingSlug = await this.categoryModel.findOne({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Category slug already exists');
    }

    return this.categoryModel.create({ ...dto });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<ProductCategory> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existingSlug = await this.categoryModel.findOne({
        where: { slug: dto.slug, id: { [Op.ne]: id } },
      });
      if (existingSlug) {
        throw new ConflictException('Category slug already exists');
      }
    }

    await category.update(dto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await category.destroy();
  }
}
