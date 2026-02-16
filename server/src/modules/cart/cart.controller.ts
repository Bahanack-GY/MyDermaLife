import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { CartService } from './cart.service';
import { OrdersService } from '../orders/orders.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutSharedCartDto } from '../orders/dto/checkout-shared-cart.dto';
import { CheckoutDto } from '../orders/dto/checkout.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
  ) {}

  private getUserId(req: Request): string | undefined {
    return (req as any).user?.id;
  }

  private getSessionToken(req: Request): string | undefined {
    return req.headers['x-session-token'] as string | undefined;
  }

  private async resolveCart(req: Request, res: Response) {
    const userId = this.getUserId(req);
    const sessionToken = this.getSessionToken(req);

    if (!userId && !sessionToken) {
      // New guest — create cart with new session token
      const result = await this.cartService.getOrCreateCart();
      if (result.sessionToken) {
        res.setHeader('x-session-token', result.sessionToken);
      }
      return result.cart;
    }

    const result = await this.cartService.getOrCreateCart(userId, sessionToken);
    if (result.sessionToken) {
      res.setHeader('x-session-token', result.sessionToken);
    }
    return result.cart;
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current cart with items' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cart = await this.resolveCart(req, res);
    return this.cartService.getCartWithItems(cart.id);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async addItem(
    @Body() dto: AddToCartDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.resolveCart(req, res);
    return this.cartService.addItem(cart.id, dto.productId, dto.quantity);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.resolveCart(req, res);
    return this.cartService.updateItemQuantity(cart.id, itemId, dto.quantity);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async removeItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.resolveCart(req, res);
    return this.cartService.removeItem(cart.id, itemId);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async clearCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cart = await this.resolveCart(req, res);
    return this.cartService.clearCart(cart.id);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Get('share')
  @ApiOperation({ summary: 'Get or generate share link token for current cart' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async getShareToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cart = await this.resolveCart(req, res);
    const shareToken = await this.cartService.getShareToken(cart.id);
    return { shareToken };
  }

  @Public()
  @Get('shared/:shareToken')
  @ApiOperation({ summary: 'View a shared cart (read-only, public)' })
  async getSharedCart(@Param('shareToken') shareToken: string) {
    return this.cartService.getSharedCart(shareToken);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('shared/:shareToken/copy')
  @ApiOperation({ summary: 'Copy all items from a shared cart into your own cart' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async copySharedCart(
    @Param('shareToken') shareToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = this.getUserId(req);
    const sessionToken = this.getSessionToken(req);

    let newSessionToken: string | undefined;
    if (!userId && !sessionToken) {
      const { v4 } = await import('uuid');
      newSessionToken = v4();
    }

    const result = await this.cartService.copySharedCartToOwn(
      shareToken,
      userId,
      sessionToken || newSessionToken,
    );

    if (newSessionToken) {
      res.setHeader('x-session-token', newSessionToken);
    }

    return result;
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout current cart',
    description:
      'Creates an order from the current cart items and clears the cart. ' +
      'Works for both authenticated users and guests (with session token).',
  })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: false })
  async checkout(
    @Body() dto: CheckoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.resolveCart(req, res);
    const userId = this.getUserId(req);
    return this.ordersService.checkout(cart.id, dto, userId);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('shared/:shareToken/checkout')
  @ApiOperation({
    summary: 'Buy items from a shared cart directly (buy for someone)',
    description:
      'Allows anyone with the share link to purchase the cart items without adding them to their own cart. ' +
      'The buyer provides their details and shipping address, and an order is created from the shared cart.',
  })
  @ApiBearerAuth()
  async checkoutSharedCart(
    @Param('shareToken') shareToken: string,
    @Body() dto: CheckoutSharedCartDto,
    @Req() req: Request,
  ) {
    const buyerUserId = this.getUserId(req);
    return this.ordersService.checkoutSharedCart(shareToken, dto, buyerUserId);
  }

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into authenticated user cart (call after login)' })
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-session-token', required: true })
  async mergeCarts(@Req() req: Request) {
    const userId = this.getUserId(req);
    const sessionToken = this.getSessionToken(req);

    if (!userId) {
      throw new BadRequestException('Authentication required to merge carts');
    }
    if (!sessionToken) {
      throw new BadRequestException('x-session-token header required to merge guest cart');
    }

    const result = await this.cartService.mergeCarts(userId, sessionToken);
    return result || { message: 'No guest cart to merge' };
  }
}
