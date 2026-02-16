import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/queries/useCart';
import { motion, AnimatePresence } from 'framer-motion';

export function CartFAB() {
    const navigate = useNavigate();
    const { data: cart } = useCart();
    const cartItemCount = cart?.itemCount || 0;

    // Don't show if cart is empty
    if (cartItemCount === 0) {
        return null;
    }

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/cart')}
            data-cart-icon
            className="fixed bottom-6 right-6 z-40 bg-brand-default text-white p-4 rounded-full shadow-2xl hover:bg-brand-dark transition-colors"
            aria-label="View cart"
        >
            <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <AnimatePresence>
                    {cartItemCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-2 -right-2 bg-white text-brand-default text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-default"
                        >
                            {cartItemCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
}
