import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategories, useBestSellers, useNewArrivals, useProducts } from '../hooks/queries/useProducts';
import { useAddToCart } from '../hooks/queries/useCart';
import { useFlyingCartAnimation } from '../hooks/useFlyingCartAnimation';
import { getImageUrl } from '../api/config';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { Search, Star, ArrowRight, ChevronDown, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Product } from '../types/api.types';

// Hero Slides Data

const heroSlides = [
    {
        id: 'summer-sale',
        path: '/products?filter=sale',
        image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=1920',
        badge: 'Solde d\'été'
    },
    {
        id: 'new-arrivals',
        path: '/products?filter=new',
        image: 'https://images.unsplash.com/photo-1623869151543-085360946272?auto=format&fit=crop&q=80&w=1920',
        badge: 'Nouveautés'
    },
    {
        id: 'bundle-offer',
        path: '/collection/bundles',
        image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1920',
        badge: 'Offre Spéciale'
    }
];

// Product Card Component
function ProductCard({ product, animateToCart }: { product: Product; animateToCart: (imageUrl: string, element: HTMLElement) => void }) {
    const { t } = useTranslation();
    const addToCart = useAddToCart();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

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
    );
}

export function ProductsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { animateToCart, FlyingCartItems } = useFlyingCartAnimation();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [page, setPage] = useState(1);
    const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Fetch real categories from API
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

    // Fetch real products from API
    const { data: bestSellersData, isLoading: bestSellersLoading } = useBestSellers();
    const { data: newArrivalsData, isLoading: newArrivalsLoading } = useNewArrivals();

    // Debug logs for best sellers and new arrivals
    useEffect(() => {
        console.log('🏆 Best Sellers:', {
            type: typeof bestSellersData,
            isArray: Array.isArray(bestSellersData),
            length: bestSellersData?.length
        });
        console.log('✨ New Arrivals:', {
            type: typeof newArrivalsData,
            isArray: Array.isArray(newArrivalsData),
            length: newArrivalsData?.length
        });
    }, [bestSellersData, newArrivalsData]);

    // Fetch all products with pagination for discovery section
    const { data: allProductsData, isLoading: allProductsLoading } = useProducts({
        page,
        limit: 12,
    });

    // Normalize the data - handle both array and paginated object formats
    const allProducts = Array.isArray(allProductsData) ? allProductsData : (allProductsData?.data || []);
    const allProductsTotalPages = Array.isArray(allProductsData) ? 1 : (allProductsData?.totalPages || 1);

    // Debug logs
    useEffect(() => {
        console.log('📦 ProductsPage Debug - All Products:');
        console.log('  - allProductsData type:', typeof allProductsData);
        console.log('  - isArray:', Array.isArray(allProductsData));
        console.log('  - allProducts length:', allProducts.length);
        console.log('  - totalPages:', allProductsTotalPages);
        console.log('  - current page:', page);
    }, [allProductsData, allProducts, allProductsTotalPages, page]);

    // Filter only active main categories (no parent), limit to 4
    const apiCategories = (categoriesData?.filter(cat => cat.isActive && !cat.parentCategoryId) || [])
        .slice(0, 4);

    // Append newly loaded products to the list
    useEffect(() => {
        if (allProducts.length > 0) {
            setAllLoadedProducts((prev) => {
                // Avoid duplicates by checking if products already exist
                const existingIds = new Set(prev.map(p => p.id));
                const newProducts = allProducts.filter(p => !existingIds.has(p.id));
                return [...prev, ...newProducts];
            });
        }
    }, [allProducts]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (
                    firstEntry.isIntersecting &&
                    !allProductsLoading &&
                    allProductsData &&
                    page < allProductsTotalPages
                ) {
                    console.log('🔄 Loading next page:', page + 1);
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [allProductsLoading, allProductsData, page, allProductsTotalPages]);

    // Auto-rotate slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />
                <FlyingCartItems />

                <main className="pt-24 pb-16">
                    {/* Hero Banner - 70% height with Background Carousel */}
                    <div className="relative h-[70vh] flex flex-col justify-center mb-12 overflow-hidden rounded-3xl mx-4 md:mx-6 shadow-2xl">
                        {/* Background Slideshow */}
                        <div className="absolute inset-0 z-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={heroSlides[currentSlide].id}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5 }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={heroSlides[currentSlide].image}
                                        // Use translated title as alt text
                                        alt={t(`productsPage.hero.${heroSlides[currentSlide].id}.title`)}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Dark overlay for text visibility */}
                                    <div className="absolute inset-0 bg-black/40" />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Content */}
                        <div className="container relative z-10 mx-auto px-4 md:px-6">
                            {/* Slide Label/Badge */}
                            <motion.div 
                                key={`label-${currentSlide}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center mb-4"
                            >
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-brand-dark shadow-md`}>
                                    {t(`productsPage.hero.${heroSlides[currentSlide].id}.badge`)}
                                </span>
                            </motion.div>

                            <motion.h1 
                                key={`title-${currentSlide}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-6xl font-serif font-medium text-white text-center mb-4 drop-shadow-lg"
                            >
                                {t(`productsPage.hero.${heroSlides[currentSlide].id}.title`)}
                            </motion.h1>
                            <motion.p 
                                key={`subtitle-${currentSlide}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/90 text-center max-w-2xl mx-auto mb-10 text-lg md:text-xl font-medium drop-shadow-md"
                            >
                                {t(`productsPage.hero.${heroSlides[currentSlide].id}.subtitle`)}
                            </motion.p>
                            
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="max-w-md mx-auto relative mb-12">
                                <input
                                    type="text"
                                    placeholder={t('productsPage.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </form>

                        </div>

                        {/* Chevron Arrow */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
                        >
                            <Link 
                                to={heroSlides[currentSlide].path}
                                className="block p-2 transition-colors hover:scale-110"
                            >
                                <ChevronDown className="w-6 h-6 text-brand-dark" />
                            </Link>
                        </motion.div>
                    </div>

                    <div className="container mx-auto px-4 md:px-6">
                        {/* Category Cards */}
                        <section className="mb-16">
                            <ScrollReveal>
                                <h2 className="text-2xl md:text-3xl font-serif font-medium text-brand-text mb-8 text-center">
                                    Explorer par catégorie
                                </h2>
                            </ScrollReveal>

                            {categoriesLoading ? (
                                <div className="text-center py-12 text-brand-muted">
                                    Chargement des catégories...
                                </div>
                            ) : (
                                <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                    {apiCategories.map((category) => (
                                        <StaggerItem key={category.id}>
                                            <Link
                                                to={`/category/${category.id}`}
                                                className="group relative block rounded-2xl overflow-hidden aspect-4/5"
                                            >
                                                <img
                                                    src={getImageUrl(category.imageUrl)}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                                    <h3 className="text-white font-serif font-bold text-lg md:text-xl mb-1">
                                                        {category.name}
                                                    </h3>
                                                    <p className="text-white/70 text-sm">
                                                        {category.description || 'Explorer cette catégorie'}
                                                    </p>
                                                </div>
                                            </Link>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            )}
                        </section>

                        {/* Best Sellers Section */}
                        <section className="mb-16">
                            <ScrollReveal>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-brand-text">
                                        Meilleures Ventes
                                    </h2>
                                    <Link
                                        to="/collection/best-sellers"
                                        className="flex items-center gap-2 text-brand-default font-medium hover:text-brand-dark transition-colors group"
                                    >
                                        {t('productsPage.viewAll')}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </ScrollReveal>

                            {bestSellersLoading ? (
                                <div className="text-center py-12 text-brand-muted">
                                    Chargement des meilleures ventes...
                                </div>
                            ) : bestSellersData && bestSellersData.length > 0 ? (
                                <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                    {bestSellersData.map((product) => (
                                        <StaggerItem key={product.id}>
                                            <ProductCard product={product} animateToCart={animateToCart} />
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                                    <p className="text-brand-muted">Aucune meilleure vente disponible pour le moment.</p>
                                </div>
                            )}
                        </section>

                        {/* New Products Section */}
                        <section className="mb-16">
                            <ScrollReveal>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-brand-text">
                                        Nouveautés
                                    </h2>
                                    <Link
                                        to="/collection/new-arrivals"
                                        className="flex items-center gap-2 text-brand-default font-medium hover:text-brand-dark transition-colors group"
                                    >
                                        {t('productsPage.viewAll')}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </ScrollReveal>

                            {newArrivalsLoading ? (
                                <div className="text-center py-12 text-brand-muted">
                                    Chargement des nouveautés...
                                </div>
                            ) : newArrivalsData && newArrivalsData.length > 0 ? (
                                <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                    {newArrivalsData.slice(0, 4).map((product) => (
                                        <StaggerItem key={product.id}>
                                            <ProductCard product={product} animateToCart={animateToCart} />
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                                    <p className="text-brand-muted">Aucune nouveauté disponible pour le moment.</p>
                                </div>
                            )}
                        </section>

                        {/* Discover All Products Section - Lazy Loading */}
                        <section className="mb-16">
                            <ScrollReveal>
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl md:text-4xl font-serif font-medium text-brand-text mb-4">
                                        Découvrir tous nos produits
                                    </h2>
                                    <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                                        Explorez notre collection complète de soins dermatologiques
                                    </p>
                                </div>
                            </ScrollReveal>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                {allLoadedProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ProductCard product={product} animateToCart={animateToCart} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Loading Indicator */}
                            {allProductsLoading && (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 text-brand-default animate-spin" />
                                    <span className="ml-3 text-brand-muted">Chargement de plus de produits...</span>
                                </div>
                            )}

                            {/* Intersection Observer Target */}
                            <div ref={loadMoreRef} className="h-20" />

                            {/* End Message */}
                            {!allProductsLoading && allProductsData && page >= allProductsTotalPages && allLoadedProducts.length > 0 && (
                                <div className="text-center py-8">
                                    <p className="text-brand-muted">Vous avez vu tous nos produits ! 🎉</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!allProductsLoading && allLoadedProducts.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                                    <p className="text-brand-muted">Aucun produit disponible pour le moment.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
