import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(ShoppingCart)
    private readonly cartModel: typeof ShoppingCart,
    @InjectModel(CartItem)
    private readonly cartItemModel: typeof CartItem,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async getOrCreateCart(
    userId?: string,
    sessionToken?: string,
  ): Promise<{ cart: ShoppingCart; sessionToken?: string }> {
    let cart: ShoppingCart | null = null;
    let newSessionToken: string | undefined;

    if (userId) {
      cart = await this.cartModel.findOne({ where: { userId } });
      if (!cart) {
        cart = await this.cartModel.create({ userId });
      }
    } else {
      if (sessionToken) {
        cart = await this.cartModel.findOne({ where: { sessionToken } });
      }
      if (!cart) {
        newSessionToken = sessionToken || uuidv4();
        cart = await this.cartModel.create({ sessionToken: newSessionToken });
      }
    }

    return { cart, sessionToken: newSessionToken };
  }

  async getCartWithItems(cartId: string) {
    const cart = await this.cartModel.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary', 'sortOrder'],
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

    return this.formatCartResponse(cart);
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    const existingItem = await this.cartItemModel.findOne({
      where: { cartId, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await this.cartItemModel.create({ cartId, productId, quantity });
    }

    return this.getCartWithItems(cartId);
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    const item = await this.cartItemModel.findOne({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = quantity;
    await item.save();

    return this.getCartWithItems(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.cartItemModel.findOne({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await item.destroy();

    return this.getCartWithItems(cartId);
  }

  async clearCart(cartId: string) {
    await this.cartItemModel.destroy({ where: { cartId } });
    return this.getCartWithItems(cartId);
  }

  async getShareToken(cartId: string): Promise<string> {
    const cart = await this.cartModel.findByPk(cartId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.shareToken) {
      cart.shareToken = randomBytes(9).toString('base64url').slice(0, 12);
      await cart.save();
    }

    return cart.shareToken;
  }

  async getSharedCart(shareToken: string) {
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
              attributes: ['id', 'name', 'slug', 'price'],
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary', 'sortOrder'],
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

    return this.formatCartResponse(cart);
  }

  async copySharedCartToOwn(
    shareToken: string,
    userId?: string,
    sessionToken?: string,
  ) {
    const sharedCart = await this.cartModel.findOne({
      where: { shareToken },
      include: [{ model: CartItem, as: 'items' }],
    });

    if (!sharedCart) {
      throw new NotFoundException('Shared cart not found');
    }

    if (!sharedCart.items?.length) {
      throw new BadRequestException('Shared cart is empty');
    }

    const { cart: myCart } = await this.getOrCreateCart(userId, sessionToken);

    // Don't copy into the same cart
    if (myCart.id === sharedCart.id) {
      throw new BadRequestException('Cannot copy your own cart');
    }

    const myItems = await this.cartItemModel.findAll({
      where: { cartId: myCart.id },
    });

    const myItemMap = new Map(
      myItems.map((item) => [item.productId, item]),
    );

    for (const sharedItem of sharedCart.items) {
      const existing = myItemMap.get(sharedItem.productId);
      if (existing) {
        existing.quantity += sharedItem.quantity;
        await existing.save();
      } else {
        await this.cartItemModel.create({
          cartId: myCart.id,
          productId: sharedItem.productId,
          quantity: sharedItem.quantity,
        });
      }
    }

    return this.getCartWithItems(myCart.id);
  }

  async mergeCarts(userId: string, guestSessionToken: string) {
    const guestCart = await this.cartModel.findOne({
      where: { sessionToken: guestSessionToken },
      include: [{ model: CartItem, as: 'items' }],
    });

    if (!guestCart || !guestCart.items?.length) {
      return;
    }

    const { cart: userCart } = await this.getOrCreateCart(userId);

    const userItems = await this.cartItemModel.findAll({
      where: { cartId: userCart.id },
    });

    const userItemMap = new Map(
      userItems.map((item) => [item.productId, item]),
    );

    for (const guestItem of guestCart.items) {
      const existing = userItemMap.get(guestItem.productId);
      if (existing) {
        existing.quantity += guestItem.quantity;
        await existing.save();
      } else {
        await this.cartItemModel.create({
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        });
      }
    }

    await this.cartItemModel.destroy({ where: { cartId: guestCart.id } });
    await guestCart.destroy();

    return this.getCartWithItems(userCart.id);
  }

  private formatCartResponse(cart: ShoppingCart) {
    const items = (cart.items || []).map((item) => {
      const product = item.product;
      const primaryImage = product?.images?.find((img) => img.isPrimary);
      const firstImage = product?.images?.[0];
      const image = primaryImage || firstImage;

      return {
        id: item.id,
        productId: item.productId,
        productName: product?.name || null,
        productSlug: product?.slug || null,
        productImage: image?.imageUrl || null,
        unitPrice: product ? Number(product.price) : 0,
        quantity: item.quantity,
        subtotal: product ? Number(product.price) * item.quantity : 0,
      };
    });

    return {
      id: cart.id,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.subtotal, 0),
      items,
    };
  }
}
