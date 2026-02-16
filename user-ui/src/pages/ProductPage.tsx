import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/queries/useProducts';
import { useAddToCart } from '../hooks/queries/useCart';
import { useFlyingCartAnimation } from '../hooks/useFlyingCartAnimation';
import { getImageUrl } from '../api/config';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { ReviewsSection } from '../components/ReviewsSection';
import { Star, Check, Minus, Plus, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function ProductPage() {
    const { t } = useTranslation();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { animateToCart, FlyingCartItems } = useFlyingCartAnimation();
    const addToCartButtonRef = useRef<HTMLButtonElement>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'use'>('details');
    const [activeImage, setActiveImage] = useState(0);

    // Fetch product data
    const { data: product, isLoading, error } = useProduct(slug || '');
    const addToCart = useAddToCart();

    const handleBuyNow = async () => {
        if (!product) {
            toast.error('Product not found');
            return;
        }

        try {
            // Add to cart first
            await addToCart.mutateAsync({
                productId: product.id,
                quantity: quantity,
            });

            // Then navigate to checkout
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add product to cart');
        }
    };

    const handleAddToCart = async () => {
        if (!product) {
            console.log('❌ No product data available');
            return;
        }

        console.log('🛒 Adding to cart:', {
            productId: product.id,
            productName: product.name,
            quantity: quantity,
            price: product.price
        });

        try {
            // Trigger flying animation
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            if (addToCartButtonRef.current && primaryImage?.imageUrl) {
                console.log('✈️ Triggering flying animation');
                animateToCart(getImageUrl(primaryImage.imageUrl), addToCartButtonRef.current);
            } else {
                console.log('⚠️ No button ref or image for animation');
            }

            const result = await addToCart.mutateAsync({
                productId: product.id,
                quantity: quantity,
            });

            console.log('✅ Successfully added to cart:', result);

            toast.success(t('productPage.addedToCart'), {
                className: "!bg-brand-default !text-white !border-transparent !rounded-3xl",
                descriptionClassName: "!text-white/90",
                action: {
                    label: t('productPage.viewCart'),
                    onClick: () => navigate('/cart'),
                },
                cancel: {
                    label: 'Fermer',
                    onClick: () => {},
                },
                duration: 4000,
            });
        } catch (error) {
            console.error('❌ Failed to add to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 text-center">
                        <p className="text-brand-muted">Chargement du produit...</p>
                    </div>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    // Error or not found state
    if (error || !product) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 text-center">
                        <h1 className="text-2xl font-serif font-bold text-brand-text mb-4">
                            Produit non trouvé
                        </h1>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-brand-default text-white px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
                        >
                            Retour aux produits
                        </Link>
                    </div>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    // Sort images by sortOrder
    const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);

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

                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-24">

                            {/* Left: Image Gallery */}
                            <div className="space-y-4">
                                <div className="aspect-4/5 bg-brand-light/30 rounded-3xl overflow-hidden relative flex items-center justify-center group border-2 border-transparent hover:border-brand-soft/50 transition-colors">
                                    <motion.img
                                        key={activeImage}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        src={getImageUrl(sortedImages[activeImage]?.imageUrl)}
                                        alt={sortedImages[activeImage]?.altText || product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {product.requiresPrescription && (
                                        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-brand-dark shadow-sm z-10">
                                            {t('productPage.prescriptionStrength')}
                                        </div>
                                    )}
                                </div>
                                {sortedImages.length > 1 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {sortedImages.map((img, i) => (
                                            <div
                                                key={img.id}
                                                onClick={() => setActiveImage(i)}
                                                className={cn(
                                                    "aspect-square bg-gray-50 rounded-xl cursor-pointer overflow-hidden transition-all border-2",
                                                    activeImage === i ? "border-brand-default" : "border-transparent hover:border-gray-200"
                                                )}
                                            >
                                                <img
                                                    src={getImageUrl(img.imageUrl)}
                                                    alt={img.altText || ''}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Product Details */}
                            <div className="flex flex-col h-full">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        {product.isBestSeller && (
                                            <span className="bg-brand-default text-white text-xs font-bold px-2 py-1 rounded">
                                                {t('productPage.bestSeller')}
                                            </span>
                                        )}
                                        {product.isNew && (
                                            <span className="bg-brand-soft text-white text-xs font-bold px-2 py-1 rounded">
                                                {t('productPage.new')}
                                            </span>
                                        )}
                                        <div className="flex items-center text-amber-400 gap-0.5 text-sm">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-medium text-brand-text ml-1">{product.rating}</span>
                                            <span className="text-brand-muted">({product.totalReviews} {t('productPage.reviews')})</span>
                                        </div>
                                    </div>

                                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-brand-text mb-4">
                                        {product.name}
                                    </h1>

                                    {product.brandName && (
                                        <p className="text-brand-muted text-sm mb-4">Par {product.brandName}</p>
                                    )}

                                    <div className="flex items-center gap-3 mb-6">
                                        <p className="text-2xl font-medium text-brand-text">{product.price.toLocaleString()} FCFA</p>
                                        {product.compareAtPrice && (
                                            <p className="text-xl text-brand-muted line-through">{product.compareAtPrice.toLocaleString()} FCFA</p>
                                        )}
                                    </div>

                                    <p className="text-brand-muted text-lg leading-relaxed mb-8">
                                        {product.shortDescription || product.longDescription}
                                    </p>

                                    {/* Benefits List */}
                                    {product.benefits && product.benefits.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {product.benefits.map((benefit, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-brand-text/80">
                                                    <div className="w-5 h-5 rounded-full bg-brand-light flex items-center justify-center text-brand-default shrink-0">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    {benefit}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stock status */}
                                    {product.stockQuantity === 0 && (
                                        <p className="text-red-500 font-medium mb-4">Rupture de stock</p>
                                    )}

                                    <div className="flex flex-col gap-4 mb-10 border-t border-b border-gray-100 py-8">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex items-center border border-gray-200 rounded-full w-max">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="p-3 hover:text-brand-default transition-colors w-10 flex justify-center"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="p-3 hover:text-brand-default transition-colors w-10 flex justify-center"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                ref={addToCartButtonRef}
                                                onClick={handleAddToCart}
                                                className="flex-1 bg-brand-text text-white py-3 px-8 rounded-full font-medium hover:bg-brand-default transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                {t('productPage.addToCart')} - {(product.price * quantity).toLocaleString()} FCFA
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={addToCart.isPending}
                                            className="w-full bg-brand-default text-white py-3 px-8 rounded-full font-medium hover:bg-brand-dark transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            {addToCart.isPending ? t('productPage.adding') : t('productPage.buyNow')}
                                        </button>
                                    </div>

                                    {/* Tabs */}
                                    <div className="mt-auto">
                                        <div className="flex border-b border-gray-200 mb-6 relative">
                                            {[
                                                { key: 'details', label: t('productPage.details') },
                                                { key: 'ingredients', label: t('productPage.ingredients') },
                                                { key: 'use', label: t('productPage.use') }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => setActiveTab(tab.key as any)}
                                                    className={cn(
                                                        "px-6 py-3 text-sm font-medium capitalize relative transition-colors",
                                                        activeTab === tab.key ? "text-brand-text" : "text-brand-muted hover:text-brand-text"
                                                    )}
                                                >
                                                    {tab.label}
                                                    {activeTab === tab.key && (
                                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-text" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="min-h-[150px] text-brand-muted leading-relaxed text-sm">
                                            {activeTab === 'details' && (
                                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    {product.longDescription || product.shortDescription || t('productPage.detailsText')}
                                                </motion.p>
                                            )}
                                            {activeTab === 'ingredients' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    {product.ingredients && product.ingredients.length > 0 ? (
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {product.ingredients.map((ingredient, i) => (
                                                                <li key={i}>{ingredient}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{t('productPage.noIngredientsAvailable')}</p>
                                                    )}
                                                </motion.div>
                                            )}
                                            {activeTab === 'use' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    {product.usageInstructions ? (
                                                        <p className="whitespace-pre-line">{product.usageInstructions}</p>
                                                    ) : (
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            <li>{t('productPage.useStep1')}</li>
                                                            <li>{t('productPage.useStep2')}</li>
                                                            <li>{t('productPage.useStep3')}</li>
                                                        </ul>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Complete Your Routine Section */}
                        {product.routines && product.routines.length > 0 && (
                            <div className="border-t border-gray-100 pt-16">
                                <h2 className="text-3xl md:text-4xl font-serif text-brand-text mb-10">
                                    Complétez votre routine
                                </h2>

                                {/* Stack multiple routines vertically */}
                                <div className="space-y-12">
                                    {product.routines.map((routine) => (
                                        <div key={routine.id} className="space-y-6">
                                            {/* Routine name (if multiple routines) */}
                                            {product.routines.length > 1 && (
                                                <h3 className="text-xl font-medium text-brand-text">
                                                    {routine.name}
                                                </h3>
                                            )}

                                            {/* Products horizontal scroll container */}
                                            <div className="relative">
                                                <div className="overflow-x-auto scrollbar-hide pb-4">
                                                    <div className="flex gap-6 min-w-min">
                                                        {routine.products.map((item) => (
                                                            item.product && (
                                                                <Link
                                                                    key={item.product.id}
                                                                    to={`/products/${item.product.slug}`}
                                                                    className={cn(
                                                                        "group cursor-pointer flex-shrink-0 w-64 transition-all",
                                                                        item.product.id === product.id && "pointer-events-none"
                                                                    )}
                                                                >
                                                                    <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden relative">
                                                                        <img
                                                                            src={getImageUrl(item.product.primaryImage)}
                                                                            alt={item.product.name}
                                                                            className={cn(
                                                                                "w-full h-full object-cover transition-transform duration-500",
                                                                                item.product.id !== product.id && "group-hover:scale-105"
                                                                            )}
                                                                        />

                                                                        {/* Current product indicator */}
                                                                        {item.product.id === product.id && (
                                                                            <div className="absolute inset-0 bg-brand-default/10 flex items-center justify-center">
                                                                                <div className="bg-brand-default text-white rounded-full p-4 shadow-lg">
                                                                                    <Plus className="w-8 h-8" />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <h3 className={cn(
                                                                        "font-medium text-brand-text mb-1 transition-colors",
                                                                        item.product.id !== product.id && "group-hover:text-brand-default"
                                                                    )}>
                                                                        {item.product.name}
                                                                    </h3>
                                                                    <p className="text-brand-muted text-sm">
                                                                        {item.product.price.toLocaleString()} FCFA
                                                                    </p>
                                                                </Link>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Add Complete Routine Button */}
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            // Add all routine products to cart
                                                            const addPromises = routine.products.map((item) => {
                                                                if (item.product) {
                                                                    return addToCart.mutateAsync({
                                                                        productId: item.product.id,
                                                                        quantity: 1,
                                                                    });
                                                                }
                                                                return Promise.resolve();
                                                            });

                                                            await Promise.all(addPromises);

                                                            toast.success('Routine complète ajoutée au panier', {
                                                                className: "!bg-brand-default !text-white !border-transparent !rounded-3xl",
                                                                action: {
                                                                    label: 'Voir le panier',
                                                                    onClick: () => navigate('/cart'),
                                                                },
                                                                duration: 4000,
                                                            });
                                                        } catch (error) {
                                                            console.error('Failed to add routine to cart:', error);
                                                            toast.error('Échec de l\'ajout de la routine');
                                                        }
                                                    }}
                                                    className="bg-brand-text text-white px-8 py-3 rounded-full font-medium hover:bg-brand-default transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                                >
                                                    <ShoppingBag className="w-5 h-5" />
                                                    Ajouter la routine complète
                                                    <span className="ml-2 text-sm opacity-90">
                                                        ({routine.products.reduce((sum, item) => sum + (item.product?.price || 0), 0).toLocaleString()} FCFA)
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Reviews Section */}
                <ReviewsSection productId={product.id} productName={product.name} />

                <Footer />
            </div>
        </PageTransition>
    );
}
