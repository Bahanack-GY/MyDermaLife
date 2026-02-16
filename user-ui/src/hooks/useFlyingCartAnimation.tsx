import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyingItem {
    id: string;
    imageUrl: string;
    startX: number;
    startY: number;
}

export function useFlyingCartAnimation() {
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    const animateToCart = useCallback((imageUrl: string, startElement: HTMLElement) => {
        // Get cart icon position
        const cartIcon = document.querySelector('[data-cart-icon]');
        if (!cartIcon) return;

        const startRect = startElement.getBoundingClientRect();

        // Create flying item
        const flyingItem: FlyingItem = {
            id: `flying-${Date.now()}`,
            imageUrl,
            startX: startRect.left + startRect.width / 2,
            startY: startRect.top + startRect.height / 2,
        };

        setFlyingItems(prev => [...prev, flyingItem]);

        // Remove after animation completes
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== flyingItem.id));
        }, 1000);
    }, []);

    const FlyingCartItems = useCallback(() => {
        const cartIcon = document.querySelector('[data-cart-icon]');
        if (!cartIcon) return null;

        const cartRect = cartIcon.getBoundingClientRect();

        return createPortal(
            <AnimatePresence>
                {flyingItems.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{
                            position: 'fixed',
                            left: item.startX,
                            top: item.startY,
                            width: 60,
                            height: 60,
                            opacity: 1,
                            scale: 1,
                            zIndex: 9999,
                        }}
                        animate={{
                            left: cartRect.left + cartRect.width / 2,
                            top: cartRect.top + cartRect.height / 2,
                            scale: 0.3,
                            opacity: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.43, 0.13, 0.23, 0.96],
                        }}
                        className="pointer-events-none"
                    >
                        <img
                            src={item.imageUrl}
                            alt="Flying to cart"
                            className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-brand-default"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>,
            document.body
        );
    }, [flyingItems]);

    return { animateToCart, FlyingCartItems };
}
