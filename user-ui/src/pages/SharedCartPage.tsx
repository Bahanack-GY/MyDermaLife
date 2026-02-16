import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSharedCart, useCopySharedCart, useCheckoutSharedCart } from '../hooks/queries/useCart';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { ShoppingCart, Copy, CreditCard, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../api/config';
import type { ShippingAddress } from '../types/api.types';

export function SharedCartPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { data: sharedCartData, isLoading, error } = useSharedCart(shareToken || '');
  const copyCart = useCopySharedCart();
  const checkoutCart = useCheckoutSharedCart();

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    city: '',
    country: 'Cameroon',
    paymentMethod: 'mobile_money',
  });

  const cart = sharedCartData;

  const handleCopyToCart = async () => {
    if (!shareToken) return;

    try {
      await copyCart.mutateAsync(shareToken);
      navigate('/cart');
    } catch (error) {
      console.error('Failed to copy cart:', error);
    }
  };

  const handleDirectCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareToken) return;

    const shippingAddress: ShippingAddress = {
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      phone: checkoutData.phone,
      addressLine1: checkoutData.addressLine1,
      city: checkoutData.city,
      country: checkoutData.country,
    };

    try {
      await checkoutCart.mutateAsync({
        shareToken,
        payload: {
          email: checkoutData.email,
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          phone: checkoutData.phone,
          shippingAddress,
          paymentMethod: checkoutData.paymentMethod as any,
        },
      });

      // Redirect to success page or order confirmation
      navigate('/order-success');
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
            <p className="text-center text-brand-muted">Loading shared cart...</p>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (error || !cart) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 text-center">
            <h1 className="text-2xl font-serif font-bold text-brand-text mb-4">
              Shared Cart Not Found
            </h1>
            <p className="text-brand-muted mb-8">
              This shared cart link is invalid or has expired.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-brand-default text-white px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Navbar />

        <main className="container mx-auto px-4 md:px-6 pt-32 pb-16">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-default transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-2">
              Shared Cart
            </h1>
            <p className="text-brand-muted">
              Someone shared this cart with you. You can add it to your cart or buy it directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-xl font-serif font-bold text-brand-text mb-6 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart Items ({cart.itemCount})
                </h2>

                {cart.items.length === 0 ? (
                  <p className="text-center text-brand-muted py-8">This cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-4 flex gap-4"
                      >
                        <img
                          src={getImageUrl(item.productImage)}
                          alt={item.productName || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-serif font-bold text-brand-text">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-brand-muted">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-brand-default font-bold mt-1">
                            {item.subtotal.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-serif font-bold text-brand-text mb-4">
                  Order Summary
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-brand-muted">
                    <span>Subtotal</span>
                    <span>{cart.totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Shipping</span>
                    <span>2 000 FCFA</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-brand-text font-bold text-lg">
                      <span>Total</span>
                      <span>{(cart.totalPrice + 2000).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                {!showCheckoutForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleCopyToCart}
                      disabled={copyCart.isPending || cart.items.length === 0}
                      className="w-full flex items-center justify-center gap-2 bg-brand-default text-white py-3 rounded-full font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-4 h-4" />
                      {copyCart.isPending ? 'Copying...' : 'Add to My Cart'}
                    </button>

                    <button
                      onClick={() => setShowCheckoutForm(true)}
                      disabled={cart.items.length === 0}
                      className="w-full flex items-center justify-center gap-2 border-2 border-brand-default text-brand-default py-3 rounded-full font-medium hover:bg-brand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-4 h-4" />
                      Buy as Gift
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDirectCheckout} className="space-y-4">
                    <h4 className="font-serif font-bold text-brand-text">
                      Checkout Details
                    </h4>

                    <input
                      type="email"
                      placeholder="Email"
                      value={checkoutData.email}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={checkoutData.firstName}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, firstName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={checkoutData.lastName}
                        onChange={(e) =>
                          setCheckoutData({ ...checkoutData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                        required
                      />
                    </div>

                    <input
                      type="tel"
                      placeholder="Phone (+237...)"
                      value={checkoutData.phone}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                      required
                    />

                    <input
                      type="text"
                      placeholder="Address"
                      value={checkoutData.addressLine1}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          addressLine1: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                      required
                    />

                    <input
                      type="text"
                      placeholder="City"
                      value={checkoutData.city}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                      required
                    />

                    <select
                      value={checkoutData.paymentMethod}
                      onChange={(e) =>
                        setCheckoutData({
                          ...checkoutData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none"
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Credit Card</option>
                    </select>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCheckoutForm(false)}
                        className="flex-1 border border-gray-200 text-brand-muted py-2 rounded-full font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={checkoutCart.isPending}
                        className="flex-1 bg-brand-default text-white py-2 rounded-full font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
                      >
                        {checkoutCart.isPending ? 'Processing...' : 'Complete Order'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
