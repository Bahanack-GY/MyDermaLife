import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ShoppingCart } from '../cart/entities/shopping-cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { CheckoutSharedCartDto } from './dto/checkout-shared-cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { DeliveriesService } from '../deliveries/deliveries.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    @InjectModel(OrderItem)
    private readonly orderItemModel: typeof OrderItem,
    @InjectModel(ShoppingCart)
    private readonly cartModel: typeof ShoppingCart,
    @InjectModel(CartItem)
    private readonly cartItemModel: typeof CartItem,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    private readonly sequelize: Sequelize,
    @Inject(forwardRef(() => DeliveriesService))
    private readonly deliveriesService: DeliveriesService,
  ) {}

  async checkout(cartId: string, dto: CheckoutDto, userId?: string) {
    const cart = await this.cartModel.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'isActive'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Guests must provide an email
    if (!userId && !dto.email) {
      throw new BadRequestException('Email is required for guest checkout');
    }

    // Validate all products are still available
    for (const item of cart.items) {
      if (!item.product) {
        throw new BadRequestException(
          `Product no longer exists for cart item ${item.id}`,
        );
      }
      if (!item.product.isActive) {
        throw new BadRequestException(
          `Product "${item.product.name}" is no longer available`,
        );
      }
    }

    // Calculate totals
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.product.price),
      discountAmount: 0,
      totalPrice: Number(item.product.price) * item.quantity,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalAmount = subtotal;

    // Create order in a transaction
    const order = await this.sequelize.transaction(async (t) => {
      const newOrder = await this.orderModel.create(
        {
          userId: userId || null,
          guestEmail: dto.email || null,
          guestFirstName: !userId ? dto.firstName : null,
          guestLastName: !userId ? dto.lastName : null,
          guestPhone: !userId ? dto.phone : null,
          status: 'pending',
          paymentStatus: 'pending',
          subtotal,
          discountAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          totalAmount,
          currency: 'XAF',
          notes: dto.notes || null,
          shippingFirstName: dto.shippingAddress.firstName,
          shippingLastName: dto.shippingAddress.lastName,
          shippingPhone: dto.shippingAddress.phone,
          shippingAddressLine1: dto.shippingAddress.addressLine1,
          shippingAddressLine2: dto.shippingAddress.addressLine2 || null,
          shippingCity: dto.shippingAddress.city,
          shippingState: dto.shippingAddress.state || null,
          shippingCountry: dto.shippingAddress.country,
        },
        { transaction: t },
      );

      await this.orderItemModel.bulkCreate(
        orderItems.map((item) => ({
          orderId: newOrder.id,
          ...item,
        })),
        { transaction: t },
      );

      // Clear the cart after successful order creation
      await this.cartItemModel.destroy({
        where: { cartId },
        transaction: t,
      });

      return newOrder;
    });

    const fullOrder = await this.findById(order.id);
    return fullOrder;
  }

  async checkoutSharedCart(
    shareToken: string,
    dto: CheckoutSharedCartDto,
    buyerUserId?: string,
  ) {
    const cart = await this.cartModel.findOne({
      where: { shareToken },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'isActive'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      throw new NotFoundException('Shared cart not found');
    }

    if (!cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate all products are still available
    for (const item of cart.items) {
      if (!item.product) {
        throw new BadRequestException(
          `Product no longer exists for cart item ${item.id}`,
        );
      }
      if (!item.product.isActive) {
        throw new BadRequestException(
          `Product "${item.product.name}" is no longer available`,
        );
      }
    }

    // Calculate totals
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.product.price),
      discountAmount: 0,
      totalPrice: Number(item.product.price) * item.quantity,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalAmount = subtotal;

    // Create order in a transaction
    const order = await this.sequelize.transaction(async (t) => {
      const newOrder = await this.orderModel.create(
        {
          userId: buyerUserId || null,
          guestEmail: dto.email,
          guestFirstName: dto.firstName,
          guestLastName: dto.lastName,
          guestPhone: dto.phone,
          status: 'pending',
          paymentStatus: 'pending',
          subtotal,
          discountAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          totalAmount,
          currency: 'XAF',
          notes: dto.notes || null,
          shippingFirstName: dto.shippingAddress.firstName,
          shippingLastName: dto.shippingAddress.lastName,
          shippingPhone: dto.shippingAddress.phone,
          shippingAddressLine1: dto.shippingAddress.addressLine1,
          shippingAddressLine2: dto.shippingAddress.addressLine2 || null,
          shippingCity: dto.shippingAddress.city,
          shippingState: dto.shippingAddress.state || null,
          shippingCountry: dto.shippingAddress.country,
        },
        { transaction: t },
      );

      await this.orderItemModel.bulkCreate(
        orderItems.map((item) => ({
          orderId: newOrder.id,
          ...item,
        })),
        { transaction: t },
      );

      return newOrder;
    });

    const fullOrder = await this.findById(order.id);
    return {
      ...fullOrder,
      buyedFor: {
        cartId: cart.id,
        cartOwnerId: cart.userId || null,
      },
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (query.search) {
      where[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${query.search}%` } },
        { guestEmail: { [Op.iLike]: `%${query.search}%` } },
        { guestFirstName: { [Op.iLike]: `%${query.search}%` } },
        { guestLastName: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt[Op.gte] = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt[Op.lte] = new Date(query.endDate);
      }
    }

    const { count, rows } = await this.orderModel.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows.map((order) => this.formatOrderResponse(order)),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findByUser(userId: string) {
    const orders = await this.orderModel.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return orders.map((order) => this.formatOrderResponse(order));
  }

  async findByTrackingToken(token: string) {
    const order = await this.orderModel.findOne({
      where: { guestTrackingToken: token },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  async findById(id: string) {
    const order = await this.orderModel.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  async findByIdForUser(id: string, userId: string) {
    const order = await this.orderModel.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findByPk(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updateData: any = { status: dto.status };

    if (dto.status === 'cancelled') {
      updateData.cancelledAt = new Date();
      if (dto.cancellationReason) {
        updateData.cancellationReason = dto.cancellationReason;
      }
    }

    if (dto.status === 'shipped') {
      updateData.shippedAt = new Date();
    }

    if (dto.status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    if (dto.notes) {
      updateData.notes = dto.notes;
    }

    await order.update(updateData);

    // Auto-create shipment when order is confirmed
    if (dto.status === 'confirmed') {
      await this.deliveriesService.create({ orderId: id });
    }

    return this.findById(id);
  }

  private formatOrderResponse(order: Order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      notes: order.notes,
      shippingAddress: {
        firstName: order.shippingFirstName,
        lastName: order.shippingLastName,
        phone: order.shippingPhone,
        addressLine1: order.shippingAddressLine1,
        addressLine2: order.shippingAddressLine2,
        city: order.shippingCity,
        state: order.shippingState,
        country: order.shippingCountry,
      },
      trackingToken: order.guestTrackingToken,
      items: (order.items || []).map((item) => {
        const primaryImage = item.product?.images?.find((img) => img.isPrimary);
        const image = primaryImage || item.product?.images?.[0];
        return {
          id: item.id,
          productId: item.productId,
          productName: item.product?.name || null,
          productSlug: item.product?.slug || null,
          productImage: image?.imageUrl || null,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        };
      }),
      createdAt: order.createdAt,
    };
  }
}
