import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts, useCategories } from '../hooks/queries/useProducts';
import { useAddToCart } from '../hooks/queries/useCart';
import { useFlyingCartAnimation } from '../hooks/useFlyingCartAnimation';
import { getImageUrl } from '../api/config';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Search, Star, SlidersHorizontal, X, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Product, ProductQueryParams } from '../types/api.types';
import { cn } from '../lib/utils';

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

export function SearchPage() {
    const { t } = useTranslation();
    const { animateToCart, FlyingCartItems } = useFlyingCartAnimation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    // Get search query from URL
    const initialQuery = searchParams.get('q') || '';
    const [searchInput, setSearchInput] = useState(initialQuery);

    // Filter states
    const [filters, setFilters] = useState<ProductQueryParams>({
        search: initialQuery,
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
    });

    // Fetch categories for filter
    const { data: categoriesData } = useCategories();
    const categories = categoriesData?.filter(cat => cat.isActive && !cat.parentCategoryId) || [];

    // Fetch products with filters
    const { data: productsData, isLoading, error } = useProducts(filters);

    // Normalize the data - handle both array and paginated object formats
    const products = Array.isArray(productsData) ? productsData : (productsData?.data || []);
    const total = Array.isArray(productsData) ? productsData.length : (productsData?.total || 0);
    const totalPages = Array.isArray(productsData) ? 1 : (productsData?.totalPages || 1);

    // Debug logs
    useEffect(() => {
        console.log('🔍 SearchPage Debug:');
        console.log('  - filters:', JSON.stringify(filters, null, 2));
        console.log('  - isLoading:', isLoading);
        console.log('  - productsData:', productsData);
        console.log('  - productsData structure:', JSON.stringify(productsData, null, 2));
        console.log('  - productsDataType:', typeof productsData);
        console.log('  - isArray:', Array.isArray(productsData));
        console.log('  - hasData prop:', productsData && 'data' in productsData);
        console.log('  - normalized products:', products);
        console.log('  - products count:', products.length);
        console.log('  - error:', error);
    }, [productsData, isLoading, filters, error, products]);

    // Update filters when URL changes
    useEffect(() => {
        const query = searchParams.get('q') || '';
        console.log('🔎 URL Search Query:', query);
        setSearchInput(query);
        setFilters(prev => ({ ...prev, search: query }));
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔎 Search Submitted:', searchInput.trim());
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput.trim() });
            setFilters(prev => ({ ...prev, search: searchInput.trim(), page: 1 }));
        }
    };

    const handleFilterChange = (key: keyof ProductQueryParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            search: initialQuery,
            page: 1,
            limit: 12,
            sortBy: 'createdAt',
            sortOrder: 'DESC',
        });
    };

    const activeFiltersCount = [
        filters.categoryId,
        filters.minPrice,
        filters.maxPrice,
        filters.skinType,
        filters.isFeatured,
        filters.isBestSeller,
    ].filter(Boolean).length;

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />
                <FlyingCartItems />

                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 md:px-6">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 text-brand-text font-medium hover:text-brand-default transition-colors hover:scale-105"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>{t('productsPage.back')}</span>
                            </Link>
                        </div>

                        {/* Search Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-4">
                                {initialQuery ? `${t('search.resultsFor')} "${initialQuery}"` : t('search.title')}
                            </h1>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="relative max-w-2xl">
                                <input
                                    type="text"
                                    placeholder={t('search.placeholder')}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white rounded-full border-2 border-gray-200 focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all text-lg"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-default text-white px-6 py-2 rounded-full font-medium hover:bg-brand-dark transition-colors"
                                >
                                    {t('search.search')}
                                </button>
                            </form>
                        </div>

                        {/* Filters Bar */}
                        <div className="mb-8 flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors",
                                    showFilters
                                        ? "bg-brand-default text-white border-brand-default"
                                        : "bg-white text-brand-text border-gray-200 hover:border-brand-default"
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="font-medium">{t('search.filters')}</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-white text-brand-default px-2 py-0.5 rounded-full text-xs font-bold">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Sort Dropdown */}
                            <select
                                value={`${filters.sortBy}-${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-');
                                    handleFilterChange('sortBy', sortBy);
                                    handleFilterChange('sortOrder', sortOrder);
                                }}
                                className="px-4 py-2 rounded-full border-2 border-gray-200 hover:border-brand-default transition-colors outline-none cursor-pointer"
                            >
                                <option value="createdAt-DESC">{t('search.sort.newest')}</option>
                                <option value="createdAt-ASC">{t('search.sort.oldest')}</option>
                                <option value="price-ASC">{t('search.sort.priceLowHigh')}</option>
                                <option value="price-DESC">{t('search.sort.priceHighLow')}</option>
                                <option value="rating-DESC">{t('search.sort.topRated')}</option>
                                <option value="totalSales-DESC">{t('search.sort.popular')}</option>
                            </select>

                            {/* Results Count */}
                            {productsData && (
                                <span className="text-brand-muted ml-auto">
                                    {total} {t('search.results')}
                                </span>
                            )}
                        </div>

                        {/* Advanced Filters Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-8 overflow-hidden"
                                >
                                    <div className="bg-brand-light/10 rounded-3xl p-6 border border-gray-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Category Filter */}
                                            <div>
                                                <label className="block text-sm font-medium text-brand-text mb-2">
                                                    {t('search.category')}
                                                </label>
                                                <select
                                                    value={filters.categoryId || ''}
                                                    onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-default transition-colors"
                                                >
                                                    <option value="">{t('search.allCategories')}</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Price Range */}
                                            <div>
                                                <label className="block text-sm font-medium text-brand-text mb-2">
                                                    {t('search.priceRange')}
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder={t('search.minPrice')}
                                                        value={filters.minPrice || ''}
                                                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-default transition-colors"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder={t('search.maxPrice')}
                                                        value={filters.maxPrice || ''}
                                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-default transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            {/* Skin Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-brand-text mb-2">
                                                    {t('search.skinType')}
                                                </label>
                                                <select
                                                    value={filters.skinType || ''}
                                                    onChange={(e) => handleFilterChange('skinType', e.target.value || undefined)}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-default transition-colors"
                                                >
                                                    <option value="">{t('search.allSkinTypes')}</option>
                                                    <option value="oily">{t('search.skinTypes.oily')}</option>
                                                    <option value="dry">{t('search.skinTypes.dry')}</option>
                                                    <option value="normal">{t('search.skinTypes.normal')}</option>
                                                    <option value="combination">{t('search.skinTypes.combination')}</option>
                                                </select>
                                            </div>

                                            {/* Special Filters */}
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <label className="block text-sm font-medium text-brand-text mb-2">
                                                    {t('search.special')}
                                                </label>
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        onClick={() => handleFilterChange('isFeatured', filters.isFeatured ? undefined : true)}
                                                        className={cn(
                                                            "px-4 py-2 rounded-full border-2 transition-colors",
                                                            filters.isFeatured
                                                                ? "bg-brand-default text-white border-brand-default"
                                                                : "bg-white text-brand-text border-gray-200 hover:border-brand-default"
                                                        )}
                                                    >
                                                        {t('search.featured')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleFilterChange('isBestSeller', filters.isBestSeller ? undefined : true)}
                                                        className={cn(
                                                            "px-4 py-2 rounded-full border-2 transition-colors",
                                                            filters.isBestSeller
                                                                ? "bg-brand-default text-white border-brand-default"
                                                                : "bg-white text-brand-text border-gray-200 hover:border-brand-default"
                                                        )}
                                                    >
                                                        {t('search.bestSeller')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clear Filters */}
                                        {activeFiltersCount > 0 && (
                                            <button
                                                onClick={clearFilters}
                                                className="mt-4 flex items-center gap-2 text-brand-default hover:text-brand-dark transition-colors font-medium"
                                            >
                                                <X className="w-4 h-4" />
                                                {t('search.clearFilters')}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results Grid */}
                        {(() => {
                            console.log('🎨 Render Decision:');
                            console.log('  - isLoading:', isLoading);
                            console.log('  - hasProductsData:', !!productsData);
                            console.log('  - products.length:', products.length);
                            console.log('  - willShowProducts:', products.length > 0);

                            if (isLoading) {
                                return (
                                    <div className="text-center py-16">
                                        <p className="text-brand-muted">{t('search.loading')}</p>
                                    </div>
                                );
                            }

                            if (products.length > 0) {
                                return (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                            {products.map(product => (
                                                <ProductCard key={product.id} product={product} animateToCart={animateToCart} />
                                            ))}
                                        </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => handleFilterChange('page', Math.max(1, filters.page! - 1))}
                                            disabled={filters.page === 1}
                                            className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-default transition-colors"
                                        >
                                            {t('search.previous')}
                                        </button>

                                        <span className="text-brand-muted">
                                            {t('search.page')} {filters.page} {t('search.of')} {totalPages}
                                        </span>

                                        <button
                                            onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page! + 1))}
                                            disabled={filters.page === totalPages}
                                            className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-default transition-colors"
                                        >
                                            {t('search.next')}
                                        </button>
                                    </div>
                                )}
                                    </>
                                );
                            }

                            return (
                                <div className="text-center py-16">
                                    <p className="text-xl text-brand-muted mb-4">{t('search.noResults')}</p>
                                    <button
                                        onClick={clearFilters}
                                        className="text-brand-default hover:text-brand-dark font-medium"
                                    >
                                        {t('search.tryDifferent')}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </main>

                <Footer />
            </div>
        </PageTransition>
    );
}
