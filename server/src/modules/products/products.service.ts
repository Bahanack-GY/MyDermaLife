import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal, Includeable } from 'sequelize';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductImage } from './entities/product-image.entity';
import { SearchLog } from './entities/search-log.entity';

export interface SearchContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  sessionToken?: string;
}
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';


@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(ProductCategory)
    private categoryModel: typeof ProductCategory,
    @InjectModel(ProductImage)
    private productImageModel: typeof ProductImage,
    @InjectModel(SearchLog)
    private searchLogModel: typeof SearchLog,
  ) {}

  private get defaultInclude(): Includeable[] {
    return [
      {
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'description', 'imageUrl', 'parentCategoryId'],
        include: [
          {
            model: ProductCategory,
            as: 'parentCategory',
            attributes: ['id', 'name', 'slug'],
          },
        ],
      },
      {
        model: ProductImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'altText', 'sortOrder', 'isPrimary'],
        separate: true,
        order: [['sort_order', 'ASC']] as any,
      },
    ];
  }

  async findAll(
    query: QueryProductDto,
    context?: SearchContext,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      categoryId,
      skinType,
      isFeatured,
      isNew,
      isBestSeller,
      requiresPrescription,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const whereClause: any = { isActive: true };

    if (categoryId) {
      const category = await this.categoryModel.findByPk(categoryId);
      if (category && category.parentCategoryId === null) {
        const subcategories = await this.categoryModel.findAll({
          where: { parentCategoryId: categoryId, isActive: true },
          attributes: ['id'],
        });
        const subcategoryIds = subcategories.map((sub) => sub.id);
        whereClause.categoryId = { [Op.in]: [categoryId, ...subcategoryIds] };
      } else {
        whereClause.categoryId = categoryId;
      }
    }

    if (skinType) {
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        literal(
          `EXISTS (SELECT 1 FROM jsonb_array_elements_text("Product"."skin_types") AS st WHERE st ILIKE '%${skinType.replace(/'/g, "''")}%')`,
        ),
      ];
    }

    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured;
    }

    if (isNew !== undefined) {
      whereClause.isNew = isNew;
    }

    if (isBestSeller !== undefined) {
      whereClause.isBestSeller = isBestSeller;
    }

    if (requiresPrescription !== undefined) {
      whereClause.requiresPrescription = requiresPrescription;
    }

    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      whereClause[Op.or] = [
        // Exact substring matches (ILIKE)
        { name: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { longDescription: { [Op.iLike]: `%${search}%` } },
        { brandName: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        // Category / parent category substring match
        literal(
          `EXISTS (SELECT 1 FROM product_categories pc WHERE pc.id = "Product".category_id AND pc.name ILIKE '%${escapedSearch}%')`,
        ),
        literal(
          `EXISTS (SELECT 1 FROM product_categories pc JOIN product_categories parent ON pc.parent_category_id = parent.id WHERE pc.id = "Product".category_id AND parent.name ILIKE '%${escapedSearch}%')`,
        ),
        // Fuzzy matching via trigram similarity (catches typos)
        literal(`similarity("Product".name, '${escapedSearch}') > 0.2`),
        literal(`similarity("Product".brand_name, '${escapedSearch}') > 0.2`),
        literal(
          `EXISTS (SELECT 1 FROM product_categories pc WHERE pc.id = "Product".category_id AND similarity(pc.name, '${escapedSearch}') > 0.2)`,
        ),
        literal(
          `EXISTS (SELECT 1 FROM product_categories pc JOIN product_categories parent ON pc.parent_category_id = parent.id WHERE pc.id = "Product".category_id AND similarity(parent.name, '${escapedSearch}') > 0.2)`,
        ),
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) {
        whereClause.price[Op.gte] = minPrice;
      }
      if (maxPrice !== undefined) {
        whereClause.price[Op.lte] = maxPrice;
      }
    }

    const offset = (page - 1) * limit;
    const sortColumn = this.getSortColumn(sortBy);

    const { rows, count } = await this.productModel.findAndCountAll({
      where: whereClause,
      include: this.defaultInclude,
      order: [[sortColumn, sortOrder]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    // Fire-and-forget: log search query
    if (search && context) {
      const { categoryId: cId, skinType: sType, minPrice: mnP, maxPrice: mxP, ...rest } = query;
      const filters: Record<string, any> = {};
      if (cId) filters.categoryId = cId;
      if (sType) filters.skinType = sType;
      if (mnP !== undefined) filters.minPrice = mnP;
      if (mxP !== undefined) filters.maxPrice = mxP;

      this.searchLogModel.create({
        userId: context.userId || null,
        sessionToken: context.sessionToken || null,
        searchQuery: search,
        filters,
        resultsCount: count,
        ipAddress: context.ip || null,
        userAgent: context.userAgent || null,
      }).catch(() => {});
    }

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findFeatured(): Promise<Product[]> {
    return this.productModel.findAll({
      where: { isFeatured: true, isActive: true },
      include: this.defaultInclude,
      order: [['created_at', 'DESC']],
    });
  }

  async findNewArrivals(): Promise<Product[]> {
    return this.productModel.findAll({
      where: { isNew: true, isActive: true },
      include: this.defaultInclude,
      order: [['created_at', 'DESC']],
    });
  }

  async findBestSellers(): Promise<Product[]> {
    return this.productModel.findAll({
      where: { isBestSeller: true, isActive: true },
      include: this.defaultInclude,
      order: [['total_sales', 'DESC']],
    });
  }

  async findByCategory(
    slug: string,
    query: QueryProductDto,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    // First find the category by slug
    const category = await this.categoryModel.findOne({
      where: { slug, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Find all subcategory IDs if this is a parent category
    const subcategories = await this.categoryModel.findAll({
      where: { parentCategoryId: category.id, isActive: true },
      attributes: ['id'],
    });

    const categoryIds = [category.id, ...subcategories.map((sub) => sub.id)];

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.productModel.findAndCountAll({
      where: {
        categoryId: { [Op.in]: categoryIds },
        isActive: true,
      },
      include: this.defaultInclude,
      order: [[sortBy === 'price' ? 'price' : 'created_at', sortOrder]],
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

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel.findOne({
      where: { slug, isActive: true },
      include: this.defaultInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findByPk(id, {
      include: this.defaultInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto, adminId: string): Promise<Product> {
    const existingSku = await this.productModel.findOne({
      where: { sku: dto.sku },
      paranoid: false,
    });
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    const existingSlug = await this.productModel.findOne({
      where: { slug: dto.slug },
      paranoid: false,
    });
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const product = await this.productModel.create({
      ...dto,
      createdBy: adminId,
    });

    return this.findById(product.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await this.productModel.findOne({
        where: { sku: dto.sku, id: { [Op.ne]: id } },
        paranoid: false,
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existingSlug = await this.productModel.findOne({
        where: { slug: dto.slug, id: { [Op.ne]: id } },
        paranoid: false,
      });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    await product.update(dto);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    const suffix = `_deleted_${Date.now()}`;
    await product.update({
      sku: product.sku + suffix,
      slug: product.slug + suffix,
    });
    await product.destroy();
  }

  async getSearchAnalytics(days: number = 30, limit: number = 20) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [topSearches, zeroResultSearches, totalResult] = await Promise.all([
      this.searchLogModel.sequelize!.query(
        `SELECT search_query AS query, COUNT(*)::int AS count, ROUND(AVG(results_count), 1) AS "avgResults"
         FROM search_logs
         WHERE created_at >= :since
         GROUP BY search_query
         ORDER BY count DESC
         LIMIT :limit`,
        { replacements: { since, limit }, type: 'SELECT' as any },
      ),
      this.searchLogModel.sequelize!.query(
        `SELECT search_query AS query, COUNT(*)::int AS count
         FROM search_logs
         WHERE created_at >= :since AND results_count = 0
         GROUP BY search_query
         ORDER BY count DESC
         LIMIT :limit`,
        { replacements: { since, limit }, type: 'SELECT' as any },
      ),
      this.searchLogModel.sequelize!.query(
        `SELECT COUNT(*)::int AS total FROM search_logs WHERE created_at >= :since`,
        { replacements: { since }, type: 'SELECT' as any },
      ),
    ]);

    return {
      topSearches: (topSearches as any[]).map((r) => ({
        query: r.query,
        count: r.count,
        avgResults: parseFloat(r.avgResults),
      })),
      zeroResultSearches,
      totalSearches: (totalResult as any[])[0]?.total || 0,
      periodDays: days,
    };
  }

  async getSearchLogs(options: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    zeroResults?: boolean;
    from?: string;
    to?: string;
  }) {
    const {
      page = 1,
      limit = 25,
      search,
      userId,
      zeroResults,
      from,
      to,
    } = options;

    const where: any = {};

    if (search) {
      where.searchQuery = { [Op.iLike]: `%${search}%` };
    }

    if (userId) {
      where.userId = userId;
    }

    if (zeroResults) {
      where.resultsCount = 0;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await this.searchLogModel.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  private getSortColumn(sortBy: string): string {
    const sortMap: Record<string, string> = {
      price: 'price',
      name: 'name',
      rating: 'rating',
      totalSales: 'total_sales',
      totalReviews: 'total_reviews',
      stockQuantity: 'stock_quantity',
      createdAt: 'created_at',
    };
    return sortMap[sortBy] || 'created_at';
  }
}
