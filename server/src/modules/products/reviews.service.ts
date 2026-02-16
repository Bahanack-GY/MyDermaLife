import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ProductReview } from './entities/product-review.entity';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(ProductReview)
    private reviewModel: typeof ProductReview,
    private sequelize: Sequelize,
  ) {}

  async create(productId: string, userId: string, dto: CreateReviewDto): Promise<ProductReview> {
    // Check if user already reviewed this product
    const existing = await this.reviewModel.findOne({
      where: { productId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Detect verified purchase
    let isVerifiedPurchase = false;
    if (dto.orderId) {
      const [results] = await this.sequelize.query(
        `SELECT 1 FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.id = :orderId
           AND o.user_id = :userId
           AND oi.product_id = :productId
           AND o.status = 'delivered'
         LIMIT 1`,
        { replacements: { orderId: dto.orderId, userId, productId } },
      );
      isVerifiedPurchase = results.length > 0;
    } else {
      // Auto-detect from any delivered order
      const [results] = await this.sequelize.query(
        `SELECT 1 FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = :userId
           AND oi.product_id = :productId
           AND o.status = 'delivered'
         LIMIT 1`,
        { replacements: { userId, productId } },
      );
      isVerifiedPurchase = results.length > 0;
    }

    const review = await this.reviewModel.create({
      productId,
      userId,
      orderId: dto.orderId || null,
      rating: dto.rating,
      title: dto.title || null,
      reviewText: dto.reviewText || null,
      isVerifiedPurchase,
    });

    return this.findOne(review.id);
  }

  async findByProduct(
    productId: string,
    query: QueryReviewDto,
  ): Promise<{ data: ProductReview[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = { productId, status: 'approved' };
    if (query.rating) {
      where.rating = query.rating;
    }

    const { rows, count } = await this.reviewModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
        },
      ],
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

  async findAll(
    query: QueryReviewDto,
  ): Promise<{ data: ProductReview[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.rating) where.rating = query.rating;
    if (query.productId) where.productId = query.productId;
    if (query.userId) where.userId = query.userId;

    const { rows, count } = await this.reviewModel.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] },
      ],
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

  async findOne(id: string): Promise<ProductReview> {
    const review = await this.reviewModel.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] },
      ],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findByUser(
    userId: string,
    query: QueryReviewDto,
  ): Promise<{ data: ProductReview[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.reviewModel.findAndCountAll({
      where: { userId },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'slug'] },
      ],
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

  async update(id: string, userId: string, dto: UpdateReviewDto): Promise<ProductReview> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    if (review.status !== 'pending') {
      throw new ForbiddenException('Only pending reviews can be edited');
    }

    await review.update(dto);
    return this.findOne(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await review.destroy();
  }

  async moderate(id: string, adminId: string, status: 'approved' | 'rejected'): Promise<ProductReview> {
    const review = await this.findOne(id);

    await review.update({
      status,
      moderatedBy: adminId,
      moderatedAt: new Date(),
    });

    return this.findOne(id);
  }

  async adminDelete(id: string): Promise<void> {
    const review = await this.findOne(id);
    await review.destroy();
  }

  async getSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
  }> {
    const [results] = await this.sequelize.query(
      `SELECT rating, COUNT(*)::int AS count
       FROM product_reviews
       WHERE product_id = :productId AND status = 'approved'
       GROUP BY rating
       ORDER BY rating DESC`,
      { replacements: { productId } },
    );

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalReviews = 0;
    let ratingSum = 0;

    for (const row of results as any[]) {
      breakdown[row.rating] = row.count;
      totalReviews += row.count;
      ratingSum += row.rating * row.count;
    }

    return {
      averageRating: totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0,
      totalReviews,
      breakdown,
    };
  }
}
