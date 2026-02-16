import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';
import bananaProduct from '../assets/images/banana-product.webp';
import vitaminCProduct from '../assets/images/vitamin-c-product.webp';
import barrierRepair from '../assets/images/barrier-repair.webp';
import hydratingCleanser from '../assets/images/hydrating-cleanser.webp';

export function ProductsSection() {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');

    const products = [
        {
            id: 1,
            nameKey: "products.nightlyDefense",
            descKey: "products.nightlyDefenseDesc",
            price: "36 000 FCFA",
            rating: "4.9",
            reviews: 128,
            image: bananaProduct,
            tagKey: "products.bestSeller",
            category: "skincare",
            brand: "byafrican"
        },
        {
            id: 2,
            nameKey: "products.dailyGlow",
            descKey: "products.dailyGlowDesc",
            price: "27 000 FCFA",
            rating: "4.8",
            reviews: 96,
            image: vitaminCProduct,
            tagKey: "products.new",
            category: "skincare",
            brand: "kbeauty"
        },
        {
            id: 3,
            nameKey: "products.barrierRestore",
            descKey: "products.barrierRestoreDesc",
            price: "22 800 FCFA",
            rating: "4.9",
            reviews: 215,
            image: barrierRepair,
            tagKey: null,
            category: "skincare",
            brand: "byafrican"
        },
        {
            id: 4,
            nameKey: "products.gentleCleanse",
            descKey: "products.gentleCleanseDesc",
            price: "16 800 FCFA",
            rating: "4.7",
            reviews: 84,
            image: hydratingCleanser,
            tagKey: null,
            category: "bodycare",
            brand: "kbeauty"
        }
    ];

    const categoryTabs = [
        { id: 'face', labelKey: 'products.categories.face', filter: (p: any) => p.category === 'skincare' },
        { id: 'body', labelKey: 'products.categories.body', filter: (p: any) => p.category === 'bodycare' },
        { id: 'kbeauty', labelKey: 'products.categories.kbeauty', filter: (p: any) => p.brand === 'kbeauty' },
        { id: 'dermBrands', labelKey: 'products.categories.dermBrands', filter: (p: any) => p.brand === 'byafrican' }
    ];

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => {
            const tab = categoryTabs.find(c => c.id === activeCategory);
            return tab ? tab.filter(p) : true;
        });

    return (
        <section id="products" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <ScrollReveal>
                    <div className="text-center md:text-left mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="max-w-xl">
                            <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-2 block">{t('products.sectionTag')}</span>
                            <h2 className="text-3xl md:text-5xl font-serif font-medium text-brand-text mb-4">
                                {t('products.sectionTitle')}
                            </h2>
                            <p className="text-brand-muted text-lg">
                                {t('products.sectionSubtitle')}
                            </p>
                        </div>
                        <Link to="/products" className="hidden md:flex items-center gap-2 text-brand-dark font-medium hover:text-brand-default transition-colors group">
                            {t('products.viewAll')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </ScrollReveal>

                {/* Category Filters */}
                <ScrollReveal delay={0.2}>
                    <div className="flex flex-wrap gap-3 mb-10 justify-center md:justify-start">
                        {/* "All" category button */}
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                                    ? 'bg-brand-dark text-white shadow-md'
                                    : 'bg-gray-100 text-brand-muted hover:bg-brand-light hover:text-brand-dark'
                                }`}
                        >
                            {t('products.categories.all')}
                        </button>

                        {/* Static categories */}
                        {categoryTabs.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                        ? 'bg-brand-dark text-white shadow-md'
                                        : 'bg-gray-100 text-brand-muted hover:bg-brand-light hover:text-brand-dark'
                                    }`}
                            >
                                {t(category.labelKey)}
                            </button>
                        ))}
                    </div>
                </ScrollReveal>

                <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {filteredProducts.map((product) => (
                        <StaggerItem key={product.id}>
                            <Link to="/product" className="group relative block border border-gray-100 rounded-3xl p-4 transition-all duration-300 hover:border-brand-default/20">
                                {/* Image Area */}
                                <div className="aspect-4/5 bg-brand-light/20 rounded-2xl mb-4 relative overflow-hidden transition-all duration-300 flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={t(product.nameKey)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {product.tagKey && (
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-text rounded-full shadow-sm">
                                            {t(product.tagKey)}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-serif font-bold text-brand-text group-hover:text-brand-default transition-colors">{t(product.nameKey)}</h3>
                                        <span className="font-medium text-brand-text">{product.price}</span>
                                    </div>
                                    <p className="text-sm text-brand-muted mb-3 line-clamp-2">{t(product.descKey)}</p>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                                        <span className="text-sm font-bold text-brand-text">{product.rating}</span>
                                        <span className="text-sm text-brand-muted">({product.reviews} {t('products.reviews')})</span>
                                    </div>
                                </div>
                            </Link>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                <ScrollReveal delay={0.3}>
                    <div className="text-center mt-16">
                        <Link to="/products" className="inline-flex items-center gap-2 border-b border-brand-text pb-1 text-brand-text hover:text-brand-default hover:border-brand-default transition-colors uppercase tracking-widest text-xs font-bold">
                            {t('products.shopAll')} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

