import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategory } from '../hooks/queries/useProducts';
import { getImageUrl } from '../api/config';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Star, ChevronDown, Search, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Reusing product data for now - in a real app this would come from a context or API
const allProducts = [
    {
        id: 1,
        name: "Nightly Defense",
        description: "Crème de nuit régénérante au rétinol pur et extraits de banane.",
        category: "Soins Visage",
        categoryId: 'soins-visage',
        price: "36 000 FCFA",
        rating: "4.9",
        reviews: 128,
        image: new URL('../assets/images/banana-product.webp', import.meta.url).href,
        tag: "Best Seller",
        subCategory: "treatment"
    },
    {
        id: 2,
        name: "Vitamin C Serum",
        description: "Sérum concentré pour un teint lumineux et uniforme.",
        category: "Soins Visage",
        categoryId: 'soins-visage',
        price: "27 000 FCFA",
        rating: "4.8",
        reviews: 96,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "Best Seller",
        subCategory: "glow"
    },
    {
        id: 3,
        name: "Hydrating Cleanser",
        description: "Nettoyant doux qui préserve la barrière cutanée.",
        category: "Soins Visage",
        categoryId: 'soins-visage',
        price: "18 000 FCFA",
        rating: "4.7",
        reviews: 84,
        image: "https://images.unsplash.com/photo-1556228578-8d85f5a4d101?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "New",
        subCategory: "cleanser"
    },
    {
        id: 4,
        name: "Barrier Repair Cream",
        description: "Soin riche pour restaurer et apaiser les peaux fragilisées.",
        category: "Soins Corps",
        categoryId: 'soins-corps',
        price: "33 000 FCFA",
        rating: "4.9",
        reviews: 215,
        image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "Best Seller",
        subCategory: "hydration"
    },
    {
        id: 5,
        name: "Sunscreen SPF 50",
        description: "Haute protection solaire sans traces blanches.",
        category: "Soins Corps",
        categoryId: 'soins-corps',
        price: "21 000 FCFA",
        rating: "4.8",
        reviews: 156,
        image: "https://images.unsplash.com/photo-1556228720-1987594b15e4?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "Best Seller",
        subCategory: "protection"
    },
    {
        id: 6,
        name: "Exfoliating Toner",
        description: "Lotion tonique aux acides de fruits pour lisser la peau.",
        category: "Soins Visage",
        categoryId: 'soins-visage',
        price: "20 000 FCFA",
        rating: "4.6",
        reviews: 72,
        image: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "New",
        subCategory: "toner"
    },
    {
        id: 7,
        name: "Men's Face Wash",
        description: "Nettoyant visage spécialement formulé pour les peaux masculines.",
        category: "Hommes",
        categoryId: 'hommes',
        price: "15 000 FCFA",
        rating: "4.5",
        reviews: 45,
        image: "https://images.unsplash.com/photo-1581182800629-7d90925ad072?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "New",
        subCategory: "cleanser"
    },
    {
        id: 8,
        name: "Anti-Aging Night Cream",
        description: "Crème de nuit anti-rides enrichie en acide hyaluronique.",
        category: "Femmes",
        categoryId: 'femmes',
        price: "42 000 FCFA",
        rating: "4.9",
        reviews: 89,
        image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?auto=format&fit=crop&q=80&w=400&h=500",
        tag: "New",
        subCategory: "treatment"
    }
];

// Product Card Component (Same as ProductsPage)
function ProductCard({ product, index }: { product: typeof allProducts[0], index: number }) {
    const { t } = useTranslation();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success(t('productPage.addedToCart'));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to="/product"
                className="group relative block border border-gray-100 rounded-3xl p-4 transition-all duration-300 hover:border-brand-default/20"
            >
                {/* Image Area */}
                <div className="aspect-4/5 bg-brand-light/20 rounded-2xl mb-4 relative overflow-hidden transition-all duration-300 flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {product.tag && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-text rounded-full shadow-sm">
                            {product.tag}
                        </div>
                    )}

                    {/* Add to Cart Button - Shows on Hover (Desktop Only) */}
                    <button
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
                        <span className="font-medium text-brand-text">{product.price}</span>
                    </div>
                    <p className="text-sm text-brand-muted mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                        <span className="text-sm font-bold text-brand-text">{product.rating}</span>
                        <span className="text-sm text-brand-muted">({product.reviews} {t('products.reviews')})</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

const CATEGORIES = {
    'hommes': {
        badgeKey: 'productsPage.hero.men.badge',
        titleKey: 'productsPage.hero.men.title',
        subtitleKey: 'productsPage.hero.men.subtitle',
        image: 'https://images.unsplash.com/photo-1623869151543-085360946272?auto=format&fit=crop&q=80&w=1920',
    },
    'femmes': {
        badgeKey: 'productsPage.hero.women.badge',
        titleKey: 'productsPage.hero.women.title',
        subtitleKey: 'productsPage.hero.women.subtitle',
        image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1920',
    },
    'soins-visage': {
        badgeKey: 'productsPage.hero.face.badge',
        titleKey: 'productsPage.hero.face.title',
        subtitleKey: 'productsPage.hero.face.subtitle',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1920',
    },
    'soins-corps': {
        badgeKey: 'productsPage.hero.body.badge',
        titleKey: 'productsPage.hero.body.title',
        subtitleKey: 'productsPage.hero.body.subtitle',
        image: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=1920',
    }
};

const FILTERS = [
    { id: 'all', label: 'productsPage.all' },
    { id: 'treatment', label: 'productsPage.treatment' },
    { id: 'glow', label: 'productsPage.glow' },
    { id: 'cleanser', label: 'productsPage.cleanser' },
    { id: 'hydration', label: 'productsPage.hydration' },
    { id: 'protection', label: 'productsPage.protection' },
    { id: 'toner', label: 'productsPage.toner' },
];

export function CategoryPage() {
    const { categoryId } = useParams();
    const { t } = useTranslation();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch real category data from API
    const { data: category, isLoading: categoryLoading, error: categoryError } = useCategory(categoryId || '');

    // Scroll to top on category change
    useEffect(() => {
        window.scrollTo(0, 0);
        setSelectedFilter('all');
    }, [categoryId]);

    // Fallback to hardcoded data if API fails or during loading
    const categoryData = CATEGORIES[categoryId as keyof typeof CATEGORIES];

    // Build image URL with fallback
    const categoryImage = getImageUrl(
        category?.imageUrl,
        categoryData?.image || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1920'
    );

    // Get subcategories from API if available, otherwise use hardcoded filters
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;
    const subcategoryFilters = hasSubcategories
        ? category.subcategories.filter(sub => sub.isActive)
        : null;

    if (categoryLoading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="min-h-screen flex items-center justify-center pt-24">
                        <p className="text-brand-muted">Loading category...</p>
                    </div>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    if (categoryError && !categoryData) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="min-h-screen flex items-center justify-center pt-24">
                        <div className="text-center">
                            <p className="text-brand-muted mb-4">Category not found</p>
                            <Link to="/products" className="text-brand-default underline">Back to Products</Link>
                        </div>
                    </div>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    const filteredProducts = allProducts.filter(product => {
        // Filter by main category
        if (product.categoryId !== categoryId) return false;
        
        // Filter by sub-category
        if (selectedFilter !== 'all' && product.subCategory !== selectedFilter) return false;

        // Filter by search query
        if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        return true;
    });

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
                                    src={categoryImage}
                                    alt={category?.name || t(categoryData?.titleKey || '')}
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
                                    {category ? t('productsPage.hero.face.badge') : t(categoryData?.badgeKey || '')}
                                </span>
                            </motion.div>



                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl md:text-5xl font-serif font-medium text-brand-text text-center mb-4"
                            >
                                {category?.name || t(categoryData?.titleKey || '')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-brand-muted text-center max-w-2xl mx-auto mb-10 text-lg"
                            >
                                {category?.description || t(categoryData?.subtitleKey || '')}
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
                        {/* Filters - Show subcategories if available */}
                        {(hasSubcategories || !category) && (
                            <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-8 pb-2">
                                {/* "All" button */}
                                <button
                                    onClick={() => setSelectedFilter('all')}
                                    className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                                        selectedFilter === 'all'
                                            ? 'bg-brand-default text-white shadow-md'
                                            : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                                    }`}
                                >
                                    {t('productsPage.all')}
                                </button>

                                {/* Real subcategories from API */}
                                {hasSubcategories ? (
                                    subcategoryFilters?.map((subcategory) => (
                                        <button
                                            key={subcategory.id}
                                            onClick={() => setSelectedFilter(subcategory.id)}
                                            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                                                selectedFilter === subcategory.id
                                                    ? 'bg-brand-default text-white shadow-md'
                                                    : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                                            }`}
                                        >
                                            {subcategory.name}
                                        </button>
                                    ))
                                ) : (
                                    /* Fallback to hardcoded filters if no subcategories */
                                    FILTERS.slice(1).map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setSelectedFilter(filter.id)}
                                            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                                                selectedFilter === filter.id
                                                    ? 'bg-brand-default text-white shadow-md'
                                                    : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                                            }`}
                                        >
                                            {t(filter.label)}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}


                        {/* Product Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-3xl">
                                <p className="text-brand-muted text-lg">
                                    {t('productsPage.noResults')}
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
