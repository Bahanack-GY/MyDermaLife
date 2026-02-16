import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@ApiTags('Product Reviews')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get(':productId/reviews')
  @Public()
  @ApiOperation({ summary: 'List approved reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Paginated approved reviews' })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: QueryReviewDto,
  ) {
    return this.reviewsService.findByProduct(productId, query);
  }

  @Get(':productId/reviews/summary')
  @Public()
  @ApiOperation({ summary: 'Rating breakdown for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Rating summary with breakdown' })
  async getSummary(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.getSummary(productId);
  }

  // ==================== AUTHENTICATED USER ENDPOINTS ====================

  @Post(':productId/reviews')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit a review for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @ApiResponse({ status: 409, description: 'Already reviewed this product' })
  async create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.create(productId, user.id, dto);
  }

  @Get('reviews/my-reviews')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List current user\'s reviews' })
  @ApiResponse({ status: 200, description: 'Paginated user reviews' })
  async findMyReviews(
    @Query() query: QueryReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.findByUser(user.id, query);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('reviews/admin')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all reviews with filters (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated reviews' })
  async findAll(@Query() query: QueryReviewDto) {
    return this.reviewsService.findAll(query);
  }

  @Put('reviews/:id/moderate')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve or reject a review' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review moderated' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async moderate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: 'approved' | 'rejected',
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.moderate(id, user.id, status);
  }

  @Delete('reviews/:id/admin')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Force-delete any review (admin)' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async adminDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.reviewsService.adminDelete(id);
    return { message: 'Review deleted successfully' };
  }

  // ==================== AUTHENTICATED USER (by ID) ====================

  @Put('reviews/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Edit own pending review' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review updated' })
  @ApiResponse({ status: 403, description: 'Not your review or not pending' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.update(id, user.id, dto);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse({ status: 403, description: 'Not your review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.reviewsService.delete(id, user.id);
    return { message: 'Review deleted successfully' };
  }
}
