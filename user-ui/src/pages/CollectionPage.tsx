import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Star, ChevronDown, Search, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useBestSellers, useNewArrivals } from '../hooks/queries/useProducts';
import { useAddToCart } from '../hooks/queries/useCart';
import { useFlyingCartAnimation } from '../hooks/useFlyingCartAnimation';
import { getImageUrl } from '../api/config';
import type { Product } from '../types/api.types';

// Product Card Component
function ProductCard({ product, index, animateToCart }: { product: Product; index: number; animateToCart: (imageUrl: string, element: HTMLElement) => void }) {
    const { t } = useTranslation();
    const addToCart = useAddToCart();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            // Trigger flying animation
            if (buttonRef.current && primaryImage?.imageUrl) {
                animateToCart(getImageUrl(primaryImage.imageUrl), buttonRef.current);
            }

            await addToCart.mutateAsync({
                productId: product.id,
                quantity: 1,
            });
            toast.success(t('productPage.addedToCart'));
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={`/products/${product.slug}`}
                className="group relative block border border-gray-100 rounded-3xl p-4 transition-all duration-300 hover:border-brand-default/20"
            >
                {/* Image Area */}
                <div className="aspect-4/5 bg-brand-light/20 rounded-2xl mb-4 relative overflow-hidden transition-all duration-300 flex items-center justify-center">
                    <img
                        src={getImageUrl(primaryImage?.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {product.isNew && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-text rounded-full shadow-sm">
                            {t('products.new')}
                        </div>
                    )}
                    {product.isBestSeller && !product.isNew && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-text rounded-full shadow-sm">
                            {t('products.bestSeller')}
                        </div>
                    )}

                    {/* Add to Cart Button - Shows on Hover (Desktop Only) */}
                    <button
                        ref={buttonRef}
                        onClick={handleAddToCart}
                        className="hidden md:block absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-brand-text hover:bg-brand-default hover:text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        aria-label="Add to cart"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                </div>

                {/* Details */}
                <div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                        <h3 className="text-lg font-serif font-bold text-brand-default transition-colors mb-1 md:mb-0">
                            {product.name}
                        </h3>
                        <div className="flex flex-col items-start md:items-end">
                            <span className="font-medium text-brand-text">{product.price.toLocaleString()} FCFA</span>
                            {product.compareAtPrice && (
                                <span className="text-sm text-brand-muted line-through">{product.compareAtPrice.toLocaleString()} FCFA</span>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-brand-muted mb-3 line-clamp-2">{product.shortDescription}</p>
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                        <span className="text-sm font-bold text-brand-text">{product.rating}</span>
                        <span className="text-sm text-brand-muted">({product.totalReviews} {t('products.reviews')})</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

const COLLECTIONS = {
    'best-sellers': {
        badgeKey: 'products.bestSeller',
        titleKey: 'productsPage.bestSellers.title',
        subtitleKey: 'productsPage.bestSellers.subtitle',
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=1920',
    },
    'new-arrivals': {
        badgeKey: 'products.new',
        titleKey: 'productsPage.newArrivals.title',
        subtitleKey: 'productsPage.newArrivals.subtitle',
        image: 'https://images.unsplash.com/photo-1556228578-8d85f5a4d101?auto=format&fit=crop&q=80&w=1920',
    }
};

export function CollectionPage() {
    const { collectionId } = useParams();
    const { t } = useTranslation();
    const { animateToCart, FlyingCartItems } = useFlyingCartAnimation();
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch data based on collection type
    const { data: bestSellersData, isLoading: bestSellersLoading } = useBestSellers();
    const { data: newArrivalsData, isLoading: newArrivalsLoading } = useNewArrivals();

    useEffect(() => {
        window.scrollTo(0, 0);
        setSearchQuery("");
    }, [collectionId]);

    const collectionData = COLLECTIONS[collectionId as keyof typeof COLLECTIONS];

    if (!collectionData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Collection not found</p>
                <Link to="/products" className="ml-4 text-brand-default underline">Back to Products</Link>
            </div>
        );
    }

    // Get products based on collection type
    const isLoading = collectionId === 'best-sellers' ? bestSellersLoading : newArrivalsLoading;
    const allProducts = collectionId === 'best-sellers' ? (bestSellersData || []) : (newArrivalsData || []);

    // Filter by search query
    const filteredProducts = searchQuery
        ? allProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allProducts;

    const scrollToProducts = () => {
        const productsElement = document.getElementById('products-grid');
        if (productsElement) {
            productsElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />
                <FlyingCartItems />

                <main className="pt-24 pb-16">
                    {/* Hero Section */}
                    <div className="relative h-[70vh] flex flex-col justify-center mb-12 overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <motion.div
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5 }}
                                className="absolute inset-0"
                            >
                                <img
                                    src={collectionData.image}
                                    alt={t(collectionData.titleKey)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
                            </motion.div>
                        </div>

                         {/* Back Button */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute top-8 left-4 md:left-8 z-20"
                        >
                            <Link 
                                to="/products" 
                                className="flex items-center gap-2 px-4 py-2 text-brand-text font-medium hover:text-brand-default transition-colors hover:scale-105"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>{t('productsPage.back')}</span>
                            </Link>
                        </motion.div>

                        {/* Content */}
                        <div className="container relative z-10 mx-auto px-4 md:px-6">
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center mb-4"
                            >
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-default text-white">
                                    {t(collectionData.badgeKey)}
                                </span>
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl md:text-5xl font-serif font-medium text-brand-text text-center mb-4"
                            >
                                {t(collectionData.titleKey)}
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-brand-muted text-center max-w-2xl mx-auto mb-10 text-lg"
                            >
                                {t(collectionData.subtitleKey)}
                            </motion.p>

                            {/* Search Bar */}
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="max-w-md mx-auto relative mb-12"
                            >
                                <input
                                    type="text"
                                    placeholder={t('productsPage.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </motion.div>
                        </div>

                         {/* Chevron Arrow */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
                            onClick={scrollToProducts}
                        >
                            <div className="block p-2 transition-colors hover:scale-110">
                                <ChevronDown className="w-6 h-6 text-brand-dark" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="container mx-auto px-4 md:px-6" id="products-grid">
                        {/* Product Grid */}
                        {isLoading ? (
                            <div className="text-center py-16">
                                <p className="text-brand-muted text-lg">
                                    {t('productsPage.loading') || 'Chargement des produits...'}
                                </p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} animateToCart={animateToCart} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-3xl">
                                <p className="text-brand-muted text-lg">
                                    {searchQuery
                                        ? (t('productsPage.noResults') || 'Aucun produit trouvé')
                                        : 'Aucun produit disponible dans cette collection pour le moment.'}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
