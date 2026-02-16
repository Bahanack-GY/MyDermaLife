import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { PageTransition } from '../components/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, useUpdateCartItem, useRemoveFromCart, useShareCart } from '../hooks/queries/useCart';
import { getImageUrl } from '../api/config';
import { toast } from 'sonner';
import { useState } from 'react';

export function CartPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Fetch real cart data
    const { data: cart, isLoading } = useCart();
    const updateCartItem = useUpdateCartItem();
    const removeFromCart = useRemoveFromCart();
    const shareCart = useShareCart();

    const handleUpdateQuantity = async (itemId: string, currentQuantity: number, delta: number) => {
        const newQuantity = Math.max(1, currentQuantity + delta);
        try {
            await updateCartItem.mutateAsync({
                itemId,
                payload: { quantity: newQuantity }
            });
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            await removeFromCart.mutateAsync(itemId);
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item');
        }
    };

    const handleShareCart = async () => {
        try {
            const response = await shareCart.mutateAsync();
            const url = `${window.location.origin}/cart/shared/${response.shareToken}`;
            setShareUrl(url);
            setShowShareModal(true);
        } catch (error) {
            console.error('Failed to share cart:', error);
            toast.error('Failed to share cart');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success(t('cartPage.linkCopied') || 'Link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy link');
        }
    };

    const cartItems = cart?.items || [];
    const subtotal = cart?.totalPrice || 0;

    // Loading state
    if (isLoading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <main className="pt-24 pb-16">
                        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                            <div className="text-center py-20">
                                <p className="text-brand-muted">Loading cart...</p>
                            </div>
                        </div>
                    </main>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <Link to="/products" className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-brand-text" />
                            </Link>
                            <h1 className="text-xl font-medium text-brand-text">
                                {t('cartPage.title')} ({cart?.itemCount || 0})
                            </h1>
                            <div className="w-9"></div> {/* Spacer for centering */}
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl">
                                <p className="text-xl text-brand-muted mb-8">{t('cartPage.emptyMessage')}</p>
                                <Link 
                                    to="/products" 
                                    className="inline-flex items-center gap-2 bg-brand-default text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    {t('cartPage.continueShopping')}
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Cart Items List */}
                                <AnimatePresence>
                                    <div className="space-y-6">
                                        {cartItems.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative flex items-center gap-4"
                                            >
                                                {/* Product Image */}
                                                <Link
                                                    to={`/products/${item.productSlug}`}
                                                    className="w-24 h-24 shrink-0 rounded-3xl overflow-hidden"
                                                >
                                                    <img
                                                        src={getImageUrl(item.productImage)}
                                                        alt={item.productName || 'Product'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </Link>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <Link to={`/products/${item.productSlug}`}>
                                                            <h3 className="text-base font-bold text-brand-text truncate pr-8 hover:text-brand-default transition-colors">
                                                                {item.productName}
                                                            </h3>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            disabled={removeFromCart.isPending}
                                                            className="text-gray-400 hover:text-red-500 transition-colors absolute top-0 right-0 p-1 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-brand-muted mb-3">{item.unitPrice.toLocaleString()} FCFA each</p>

                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-brand-text">
                                                            {item.subtotal.toLocaleString()} FCFA
                                                        </span>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                                disabled={updateCartItem.isPending || item.quantity <= 1}
                                                                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-xl hover:border-brand-default text-brand-text transition-colors disabled:opacity-50"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                                disabled={updateCartItem.isPending}
                                                                className="w-8 h-8 flex items-center justify-center border border-brand-default bg-transparent text-brand-default rounded-xl hover:bg-brand-default hover:text-white transition-colors disabled:opacity-50"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </AnimatePresence>

                                {/* Promo Code */}
                                <div className="border border-gray-100 rounded-2xl p-2 flex items-center justify-between pr-4 bg-white shadow-sm">
                                    <input 
                                        type="text" 
                                        placeholder={t('cartPage.promoCode')}
                                        className="flex-1 px-4 py-2 outline-none text-brand-text placeholder:text-brand-muted bg-transparent"
                                    />
                                    <button className="text-brand-default font-medium text-sm hover:text-brand-dark transition-colors">
                                        {t('cartPage.apply')}
                                    </button>
                                </div>

                                {/* Summary */}
                                <div className="space-y-3 pt-4">
                                    <div className="flex justify-between text-brand-text">
                                        <span className="text-brand-muted">{t('cartPage.subtotal')}:</span>
                                        <span className="font-bold">{subtotal.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-brand-text">
                                        <span className="text-brand-muted">{t('cartPage.shipping')}:</span>
                                        <span className="font-bold">2 000 FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-brand-text">
                                        <span className="text-brand-muted">{t('cartPage.discount')}:</span>
                                        <span className="font-bold text-brand-default">0%</span>
                                    </div>
                                </div>

                                {/* Share Cart Button */}
                                <button
                                    onClick={handleShareCart}
                                    disabled={shareCart.isPending}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-brand-default text-brand-default py-3 rounded-2xl font-bold hover:bg-brand-light transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Share2 className="w-5 h-5" />
                                    {t('cartPage.shareCart') || 'Share Cart'}
                                </button>

                                {/* Checkout Button */}
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-brand-default text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-lg active:scale-95"
                                >
                                     {t('cartPage.checkoutFor')} {(subtotal + 2000).toLocaleString()} FCFA
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                {/* Share Cart Modal */}
                <AnimatePresence>
                    {showShareModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowShareModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-3xl p-6 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-brand-text">
                                        {t('cartPage.shareCart') || 'Share Cart'}
                                    </h3>
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <p className="text-brand-muted mb-4">
                                    {t('cartPage.shareDescription') || 'Share this link with friends so they can view or purchase your cart items:'}
                                </p>

                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-4 py-3 bg-brand-default text-white rounded-xl hover:bg-brand-dark transition-colors flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="w-full py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('common.close') || 'Close'}
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
