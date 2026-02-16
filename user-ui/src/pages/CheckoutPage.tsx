import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { PageTransition } from '../components/PageTransition';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Edit3, Bookmark, Download, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useCheckout, useCart } from '../hooks/queries/useCart';
import { useAuth } from '../hooks/useAuth';
import type { CheckoutPayload, PaymentMethod } from '../types/api.types';
import momoLogo from '../assets/momo.webp';
import orangeMoneyLogo from '../assets/orange money.png';

// Payment Methods Data
const paymentMethods = [
    { id: 'om', name: 'Orange Money', logo: orangeMoneyLogo },
    { id: 'momo', name: 'MTN MoMo', logo: momoLogo },
];

// Country configurations
const countryConfig = {
    'Cameroon': {
        code: '+237',
        placeholder: '6 XX XX XX XX',
    },
    'Ivory Coast': {
        code: '+225',
        placeholder: '01 02 03 04 05',
    }
};

// Mock Saved Addresses
const savedAddresses = [
    { id: 1, label: 'Domicile', fullName: 'Jean Dupont', phone: '+225 01 02 03 04 05', address: '123 Rue de la Paix', city: 'Abidjan' },
    { id: 2, label: 'Bureau', fullName: 'Jean Dupont', phone: '+225 06 07 08 09 10', address: '456 Avenue du Commerce', city: 'Abidjan' },
];

export function CheckoutPage() {
    const { t } = useTranslation();
    // React Query hooks
    const { data: cart, isLoading: isLoadingCart } = useCart();
    const checkout = useCheckout();
    const { isAuthenticated } = useAuth();

    // Debug cart state
    console.log('🛒 Checkout Page - Cart State:', {
        cart,
        isLoading: isLoadingCart,
        itemCount: cart?.itemCount,
        totalPrice: cart?.totalPrice
    });

    // Steps: 0 = Address, 1 = Payment, 2 = Processing, 3 = Success
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [addressMethod, setAddressMethod] = useState<'manual' | 'location' | 'saved'>('manual');
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState<number | null>(null);
    const [locationCoords, setLocationCoords] = useState<{lat: number, lon: number} | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Cameroon', // Default
        cardNumber: '',
        expiry: '',
        cvc: '',
        mobileNumber: '',
        latitude: null as number | null,
        longitude: null as number | null
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getCurrentLocation = () => {
        console.log('📍 Detecting location...');
        setIsDetectingLocation(true);

        if (!navigator.geolocation) {
            toast.error(t('checkoutPage.address.locationError'));
            setIsDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Location detected:', { latitude, longitude });
                setLocationCoords({ lat: latitude, lon: longitude });
                const defaultCity = formData.country === 'Cameroon' ? 'Douala' : 'Abidjan';
                setFormData(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    address: `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`,
                    // Keep existing city if already filled, otherwise set a default
                    city: prev.city || defaultCity
                }));
                console.log('📍 Form updated with location and default city:', defaultCity);
                setIsDetectingLocation(false);
                toast.success(t('checkoutPage.address.locationDetected'));
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.error(t('checkoutPage.address.locationError'));
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSavedAddressSelect = (addressId: number) => {
        const selected = savedAddresses.find(addr => addr.id === addressId);
        if (selected) {
            setSelectedSavedAddress(addressId);
            setFormData(prev => ({
                ...prev,
                fullName: selected.fullName,
                phone: selected.phone,
                address: selected.address,
                city: selected.city
            }));
        }
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Detailed validation
        const missingFields = [];
        if (!formData.fullName) missingFields.push('Full Name');
        if (!formData.address) missingFields.push('Address');
        if (!formData.city) missingFields.push('City');
        if (!formData.phone) missingFields.push('Phone');

        if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        // Require email for guest users
        if (!isAuthenticated && !formData.email) {
            toast.error("Email is required for checkout");
            return;
        }

        setCurrentStep(1);
        window.scrollTo(0, 0);
    };

    const handlePaymentSubmit = async () => {
        console.log('💳 Payment submit clicked');
        console.log('💳 Form data:', formData);
        console.log('💳 Cart:', cart);
        console.log('💳 Selected payment:', selectedPayment);

        if (!selectedPayment) {
            toast.error("Please select a payment method");
            return;
        }

        // Validate required fields
        if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.country) {
            const missing = [];
            if (!formData.fullName) missing.push('Full Name');
            if (!formData.phone) missing.push('Phone');
            if (!formData.address) missing.push('Address');
            if (!formData.city) missing.push('City');
            if (!formData.country) missing.push('Country');
            console.log('❌ Missing fields:', missing);
            toast.error(`Please fill in: ${missing.join(', ')}`);
            return;
        }

        if (!cart) {
            console.log('❌ No cart available');
            toast.error("Cart is empty or not loaded");
            return;
        }

        console.log('✅ All validations passed, proceeding with checkout...');

        // Split fullName into firstName and lastName
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name as last if only one name

        // Map payment method IDs to API PaymentMethod type
        const paymentMethodMap: Record<string, PaymentMethod> = {
            'om': 'mobile_money',
            'momo': 'mobile_money',
            'card': 'card',
            'djamo': 'card',
        };
        const paymentMethod = paymentMethodMap[selectedPayment] || 'mobile_money';

        // Build checkout payload
        const checkoutPayload: CheckoutPayload = {
            firstName,
            lastName,
            phone: formData.phone,
            shippingAddress: {
                firstName,
                lastName,
                phone: formData.phone,
                addressLine1: formData.address,
                city: formData.city,
                country: formData.country,
            },
            paymentMethod,
            notes: formData.mobileNumber ? `Mobile Money Number: ${formData.mobileNumber}` : undefined,
        };

        // Add email if provided (required for guests)
        if (formData.email) {
            checkoutPayload.email = formData.email;
        }

        try {
            setCurrentStep(2);

            await checkout.mutateAsync(checkoutPayload);

            // Show success state
            setCurrentStep(3);
            toast.success(t('checkoutPage.success.subtitle'));
        } catch (error: any) {
            // Go back to payment step
            setCurrentStep(1);

            const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
            toast.error(errorMessage);
        }
    };

    // Step Indicator Component
    const StepIndicator = ({ step, label, isActive, isCompleted }: { step: number, label: string, isActive: boolean, isCompleted: boolean }) => (
        <div className="flex flex-col items-center relative z-10 w-24">
            <div 
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                    isCompleted ? "bg-brand-default border-brand-default text-white" :
                    isActive ? "bg-brand-default border-brand-default text-white" :
                    "bg-white border-gray-200 text-gray-400"
                )}
            >
                {isCompleted ? <Check className="w-5 h-5" /> : step + 1}
            </div>
            <span className={cn(
                "text-xs mt-2 font-medium transition-colors duration-300 uppercase tracking-wide",
                isActive || isCompleted ? "text-brand-text" : "text-gray-400"
            )}>
                {label}
            </span>
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />

                <main className="pt-32 pb-16">
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl">

                        {/* Header */}
                        {currentStep < 3 && (
                            <div className="flex items-center mb-12">
                                <Link to="/cart" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors mr-4">
                                    <ArrowLeft className="w-5 h-5 text-brand-text" />
                                </Link>
                                <h1 className="text-2xl font-serif font-bold text-brand-text">Checkout</h1>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoadingCart && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                                <div className="w-16 h-16 rounded-full border-4 border-brand-light border-t-brand-default animate-spin mx-auto mb-4" />
                                <p className="text-brand-muted">Loading cart...</p>
                            </div>
                        )}

                        {/* Empty Cart State */}
                        {!isLoadingCart && (!cart || !cart.items || cart.items.length === 0) && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                                <ShoppingBag className="w-16 h-16 text-brand-muted mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-brand-text mb-2">Your cart is empty</h2>
                                <p className="text-brand-muted mb-6">Add some products to your cart before checking out</p>
                                <Link
                                    to="/products"
                                    className="inline-block bg-brand-default text-white py-3 px-6 rounded-full font-medium hover:bg-brand-dark transition-all"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        )}

                        {/* Steps UI */}
                        {!isLoadingCart && cart && cart.items && cart.items.length > 0 && currentStep < 3 && (
                            <div className="flex justify-between items-center mb-12 relative px-4 md:px-12">
                                {/* Progress Bar Line */}
                                <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200 z-0">
                                    <motion.div 
                                        className="h-full bg-brand-default origin-left"
                                        initial={{ scaleX: 0 }}
                                        animate={{ 
                                            scaleX: currentStep === 0 ? 0 : currentStep === 1 ? 0.5 : 1 
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                <StepIndicator 
                                    step={0} 
                                    label={t('checkoutPage.steps.address')} 
                                    isActive={currentStep === 0} 
                                    isCompleted={currentStep > 0} 
                                />
                                <StepIndicator 
                                    step={1} 
                                    label={t('checkoutPage.steps.payment')} 
                                    isActive={currentStep === 1} 
                                    isCompleted={currentStep > 1} 
                                />
                                <StepIndicator 
                                    step={2} 
                                    label={t('checkoutPage.steps.confirmation')} 
                                    isActive={currentStep >= 3} 
                                    isCompleted={currentStep === 3} 
                                />
                            </div>
                        )}

                        {/* Content Area */}
                        {!isLoadingCart && cart && cart.items && cart.items.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[400px]">
                                <AnimatePresence mode="wait">
                                
                                {/* STEP 1: ADDRESS */}
                                {currentStep === 0 && (
                                    <motion.div
                                        key="address"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-xl font-bold text-brand-text mb-6">
                                            {t('checkoutPage.address.title')}
                                        </h2>

                                        {/* Address Method Selector */}
                                        <div className="flex flex-col md:flex-row gap-3 mb-8">
                                            <button
                                                type="button"
                                                onClick={() => setAddressMethod('manual')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium",
                                                    addressMethod === 'manual'
                                                        ? "border-brand-default bg-brand-default/5 text-brand-text"
                                                        : "border-gray-200 text-brand-muted hover:border-brand-default/40"
                                                )}
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                {t('checkoutPage.address.fillAddress')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddressMethod('location');
                                                    getCurrentLocation();
                                                }}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium",
                                                    addressMethod === 'location'
                                                        ? "border-brand-default bg-brand-default/5 text-brand-text"
                                                        : "border-gray-200 text-brand-muted hover:border-brand-default/40"
                                                )}
                                            >
                                                <MapPin className="w-4 h-4" />
                                                {t('checkoutPage.address.useLocation')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAddressMethod('saved')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium",
                                                    addressMethod === 'saved'
                                                        ? "border-brand-default bg-brand-default/5 text-brand-text"
                                                        : "border-gray-200 text-brand-muted hover:border-brand-default/40"
                                                )}
                                            >
                                                <Bookmark className="w-4 h-4" />
                                                {t('checkoutPage.address.savedAddresses')}
                                            </button>
                                        </div>

                                        {/* Content based on selected method */}
                                        <AnimatePresence mode="wait">
                                            {/* Manual Address Form */}
                                            {addressMethod === 'manual' && (
                                                <motion.form
                                                    key="manual"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    onSubmit={handleAddressSubmit}
                                                    className="space-y-6"
                                                >
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.fullName')}</label>
                                                            <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-1 focus:ring-brand-default outline-none transition-all" />
                                                        </div>
                                                        {!isAuthenticated && (
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.email')}</label>
                                                                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-1 focus:ring-brand-default outline-none transition-all" />
                                                            </div>
                                                        )}
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.phone')}</label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                                    {countryConfig[formData.country as keyof typeof countryConfig]?.code || '+237'}
                                                                </span>
                                                                <input
                                                                    required
                                                                    name="phone"
                                                                    value={formData.phone}
                                                                    onChange={handleInputChange}
                                                                    type="tel"
                                                                    placeholder={countryConfig[formData.country as keyof typeof countryConfig]?.placeholder || '6 XX XX XX XX'}
                                                                    className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-1 focus:ring-brand-default outline-none transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.address')}</label>
                                                            <input required name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-1 focus:ring-brand-default outline-none transition-all" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.city')}</label>
                                                            <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default focus:ring-1 focus:ring-brand-default outline-none transition-all" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.country')}</label>
                                                            <select
                                                                name="country"
                                                                value={formData.country}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-text focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all"
                                                            >
                                                                <option value="Cameroon">Cameroon</option>
                                                                <option value="Ivory Coast">Ivory Coast</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6">
                                                        <button type="submit" className="w-full bg-brand-default text-white py-4 rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95">
                                                            {t('checkoutPage.address.continue')}
                                                        </button>
                                                    </div>
                                                </motion.form>
                                            )}

                                            {/* Geolocation */}
                                            {addressMethod === 'location' && (
                                                <motion.div
                                                    key="location"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-6"
                                                >
                                                    {isDetectingLocation ? (
                                                        <div className="flex flex-col items-center justify-center py-12">
                                                            <div className="w-16 h-16 rounded-full border-4 border-brand-light border-t-brand-default animate-spin mb-4" />
                                                            <p className="text-brand-muted">{t('checkoutPage.address.detectingLocation')}</p>
                                                        </div>
                                                    ) : locationCoords ? (
                                                        <div className="space-y-4">
                                                            <div className="bg-brand-default/10 border border-brand-default/30 rounded-xl p-4 flex items-start gap-3">
                                                                <Check className="w-5 h-5 text-brand-default mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="font-medium text-brand-text">{t('checkoutPage.address.locationDetected')}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <form onSubmit={handleAddressSubmit} className="space-y-6">
                                                                <div className="grid md:grid-cols-2 gap-6">
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.fullName')}</label>
                                                                        <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none" />
                                                                    </div>
                                                                    {!isAuthenticated && (
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.email')}</label>
                                                                            <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none" />
                                                                        </div>
                                                                    )}
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.phone')}</label>
                                                                        <div className="relative">
                                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                                                {countryConfig[formData.country as keyof typeof countryConfig]?.code || '+237'}
                                                                            </span>
                                                                            <input
                                                                                required
                                                                                name="phone"
                                                                                value={formData.phone}
                                                                                onChange={handleInputChange}
                                                                                type="tel"
                                                                                placeholder={countryConfig[formData.country as keyof typeof countryConfig]?.placeholder || '6 XX XX XX XX'}
                                                                                className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="md:col-span-2 space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">
                                                                            {t('checkoutPage.address.address')}
                                                                            <span className="text-xs text-brand-muted ml-2">(Coordinates detected)</span>
                                                                        </label>
                                                                        <input
                                                                            required
                                                                            name="address"
                                                                            value={formData.address}
                                                                            onChange={handleInputChange}
                                                                            type="text"
                                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none bg-gray-50"
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.city')}</label>
                                                                        <input
                                                                            required
                                                                            name="city"
                                                                            value={formData.city}
                                                                            onChange={handleInputChange}
                                                                            type="text"
                                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none"
                                                                            placeholder="Douala, Abidjan, etc."
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.country')}</label>
                                                                        <select
                                                                            name="country"
                                                                            value={formData.country}
                                                                            onChange={handleInputChange}
                                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-brand-text focus:border-brand-default outline-none"
                                                                        >
                                                                            <option value="Cameroon">Cameroon</option>
                                                                            <option value="Ivory Coast">Ivory Coast</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <button type="submit" className="w-full bg-brand-default text-white py-4 rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95">
                                                                    {t('checkoutPage.address.continue')}
                                                                </button>
                                                            </form>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                                            <MapPin className="w-16 h-16 text-brand-default mb-4" />
                                                            <button
                                                                onClick={getCurrentLocation}
                                                                className="bg-brand-default text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors"
                                                            >
                                                                {t('checkoutPage.address.useLocation')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Saved Addresses */}
                                            {addressMethod === 'saved' && (
                                                <motion.div
                                                    key="saved"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-6"
                                                >
                                                    {savedAddresses.length === 0 ? (
                                                        <div className="text-center py-12 text-brand-muted">
                                                            {t('checkoutPage.address.noSavedAddresses')}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="grid gap-4">
                                                                {savedAddresses.map((addr) => (
                                                                    <button
                                                                        key={addr.id}
                                                                        type="button"
                                                                        onClick={() => handleSavedAddressSelect(addr.id)}
                                                                        className={cn(
                                                                            "text-left p-4 rounded-xl border-2 transition-all duration-200",
                                                                            selectedSavedAddress === addr.id
                                                                                ? "border-brand-default bg-brand-default/5"
                                                                                : "border-gray-200 hover:border-brand-default/40"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <span className="px-2 py-0.5 bg-brand-default/10 text-brand-default text-xs font-medium rounded">{addr.label}</span>
                                                                                </div>
                                                                                <p className="font-medium text-brand-text mb-1">{addr.fullName}</p>
                                                                                <p className="text-sm text-brand-muted">{addr.address}, {addr.city}</p>
                                                                                <p className="text-sm text-brand-muted">{addr.phone}</p>
                                                                            </div>
                                                                            {selectedSavedAddress === addr.id && (
                                                                                <Check className="w-5 h-5 text-brand-default shrink-0" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            
                                                            {selectedSavedAddress && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAddressSubmit(e);
                                                                    }}
                                                                    className="w-full bg-brand-default text-white py-4 rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95"
                                                                >
                                                                    {t('checkoutPage.address.continue')}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}

                                {/* STEP 2: PAYMENT */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <h2 className="text-xl font-bold text-brand-text mb-6">
                                            {t('checkoutPage.payment.title')}
                                        </h2>

                                        {/* Payment Methods Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {paymentMethods.map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedPayment(method.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 gap-3 group",
                                                        selectedPayment === method.id
                                                            ? "border-brand-default bg-brand-default/5 ring-2 ring-brand-default"
                                                            : "border-gray-200 hover:border-brand-default/40 bg-white"
                                                    )}
                                                >
                                                    <div className="w-full h-20 flex items-center justify-center">
                                                        <img
                                                            src={method.logo}
                                                            alt={method.name}
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        selectedPayment === method.id ? "text-brand-text" : "text-brand-muted"
                                                    )}>
                                                        {method.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Dynamic Payment Form */}
                                        <AnimatePresence mode="wait">
                                            {selectedPayment && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                        {selectedPayment === 'card' || selectedPayment === 'djamo' ? (
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.payment.cardNumber')}</label>
                                                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none bg-white" />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.payment.expiry')}</label>
                                                                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none bg-white" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.payment.cvc')}</label>
                                                                        <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none bg-white" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : selectedPayment === 'paypal' ? (
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.address.email')}</label>
                                                                    <input type="email" placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none bg-white" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-brand-muted">{t('checkoutPage.payment.mobileNumber')}</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                                            {countryConfig[formData.country as keyof typeof countryConfig]?.code || '+237'}
                                                                        </span>
                                                                        <input
                                                                            type="tel"
                                                                            name="mobileNumber"
                                                                            value={formData.mobileNumber}
                                                                            onChange={handleInputChange}
                                                                            placeholder={countryConfig[formData.country as keyof typeof countryConfig]?.placeholder || '6 XX XX XX XX'}
                                                                            className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-default outline-none bg-white"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="pt-4">
                                            <button 
                                                onClick={handlePaymentSubmit}
                                                disabled={!selectedPayment}
                                                className="w-full bg-brand-default text-white py-4 rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {t('checkoutPage.payment.pay')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: PROCESSING */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <div className="w-20 h-20 rounded-full border-4 border-brand-light border-t-brand-default animate-spin mb-8" />
                                        <h2 className="text-2xl font-serif font-bold text-brand-text mb-2">
                                            {t('checkoutPage.payment.processing')}
                                        </h2>
                                        <p className="text-brand-muted">
                                            Veuillez patienter quelques instants...
                                        </p>
                                    </motion.div>
                                )}

                                {/* STEP 4: SUCCESS */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-10 text-center"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-8">
                                            <Check className="w-12 h-12" />
                                        </div>
                                        <h2 className="text-3xl font-serif font-bold text-brand-text mb-4">
                                            {t('checkoutPage.success.title')}
                                        </h2>
                                        <p className="text-brand-muted mb-12 max-w-md mx-auto">
                                            {t('checkoutPage.success.subtitle')}
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                            <button className="flex-1 border border-gray-200 text-brand-text py-3 px-6 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                                <Download className="w-5 h-5" />
                                                {t('checkoutPage.success.downloadReceipt')}
                                            </button>
                                            <Link 
                                                to="/products"
                                                className="flex-1 bg-brand-default text-white py-3 px-6 rounded-full font-medium hover:bg-brand-dark transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                {t('checkoutPage.success.continueShopping')}
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}

                                </AnimatePresence>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </PageTransition>
    );
}
