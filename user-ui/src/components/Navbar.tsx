import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Globe, Search, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BookingWizard } from './BookingWizard';
import { useCart } from '../hooks/queries/useCart';
import { useAuth, useLogout } from '../hooks/useAuth';

export function Navbar() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { data: cart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const logoutMutation = useLogout();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownOpenDoctors, setIsDropdownOpenDoctors] = useState(false);
    const [isDropdownOpenMethod, setIsDropdownOpenMethod] = useState(false);

    const cartItemCount = cart?.itemCount || 0;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-xl md:text-2xl font-logo text-brand-text">MyDermaLife</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Consultation Dropdown */}
                    <div
                        className="relative group h-full flex items-center"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <Link
                            to="/consultation"
                            className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:text-brand-default transition-colors py-2"
                        >
                            {t('nav.home')}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </Link>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden z-50"
                                >
                                    <div className="flex flex-col">
                                        <Link to="/consultation" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.consultation.online')}
                                        </Link>
                                        <Link to="/consultation#motifs" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.consultation.reasons')}
                                        </Link>
                                        <Link to="/consultation#deroulement" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.consultation.process')}
                                        </Link>
                                        <Link to="/consultation#tarifs" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.consultation.pricing')}
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Doctors Dropdown */}
                    <div
                        className="relative group h-full flex items-center"
                        onMouseEnter={() => setIsDropdownOpenDoctors(true)}
                        onMouseLeave={() => setIsDropdownOpenDoctors(false)}
                    >
                        <Link
                            to="/doctors"
                            className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:text-brand-default transition-colors py-2"
                        >
                            {t('nav.doctors')}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpenDoctors ? 'rotate-180' : ''}`} />
                        </Link>

                        <AnimatePresence>
                            {isDropdownOpenDoctors && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden z-50"
                                >
                                    <div className="flex flex-col">
                                        <Link to="/doctors" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.doctorsMenu.team')}
                                        </Link>
                                        <Link to="/doctors/certifications" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.doctorsMenu.certified')}
                                        </Link>
                                        <Link to="/doctors/specialties" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.doctorsMenu.specialties')}
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link to="/products" className="text-sm font-medium text-brand-dark hover:text-brand-default transition-colors">{t('nav.products')}</Link>
                    {/* Method Dropdown */}
                    <div
                        className="relative group h-full flex items-center"
                        onMouseEnter={() => setIsDropdownOpenMethod(true)}
                        onMouseLeave={() => setIsDropdownOpenMethod(false)}
                    >
                        <Link
                            to="/how-it-works/patient-journey"
                            className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:text-brand-default transition-colors py-2"
                        >
                            {t('nav.approach')}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpenMethod ? 'rotate-180' : ''}`} />
                        </Link>

                        <AnimatePresence>
                            {isDropdownOpenMethod && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden z-50"
                                >
                                    <div className="flex flex-col">
                                        <Link to="/how-it-works/patient-journey" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.howItWorks.patientJourney')}
                                        </Link>
                                        <Link to="/how-it-works/online-consultation" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.howItWorks.onlineConsultation')}
                                        </Link>
                                        <Link to="/how-it-works/security" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.howItWorks.security')}
                                        </Link>
                                        <Link to="/how-it-works/pricing" className="px-4 py-3 text-sm text-brand-text hover:bg-brand-light/20 hover:text-brand-default rounded-lg transition-colors text-left flex items-center justify-between group/item">
                                            {t('nav.howItWorks.pricing')}
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Icons / Actions */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1 text-brand-text hover:text-brand-default transition-colors text-sm font-medium"
                        title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                    >
                        <Globe className="w-5 h-5" />
                        <span className="uppercase">{i18n.language}</span>
                    </button>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="text-brand-text hover:text-brand-default transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    {isAuthenticated ? (
                        <Link to="/profile" className="relative flex items-center gap-2 text-brand-text hover:text-brand-default transition-colors group">
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-default flex items-center justify-center text-brand-default text-xs font-bold bg-brand-default/10 group-hover:border-brand-dark transition-colors">
                                {user?.profile?.profilePhoto ? (
                                    <img src={user.profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.profile?.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />
                                )}
                            </div>
                            <span className="text-sm font-medium hidden lg:inline">{user?.profile?.firstName}</span>
                            <span className="absolute bottom-0 right-0 lg:right-auto lg:left-7 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                        </Link>
                    ) : (
                        <Link to="/login" className="flex items-center gap-1.5 text-brand-text hover:text-brand-default transition-colors text-sm font-medium">
                            <LogIn className="w-5 h-5" />
                            <span>Connexion</span>
                        </Link>
                    )}
                    <Link to="/cart" className="text-brand-text hover:text-brand-default transition-colors relative">
                        <ShoppingBag className="w-5 h-5" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-brand-default text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsBookingWizardOpen(true)}
                        className="bg-brand-default text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
                    >
                        {t('nav.getStarted')}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-4">
                    {/* Language Toggle Mobile */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1 text-brand-text hover:text-brand-default transition-colors text-sm font-medium"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="uppercase text-xs">{i18n.language}</span>
                    </button>
                    <button
                        className="text-brand-text"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Search Bar Dropdown */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100"
                    >
                        <div className="container mx-auto px-4 md:px-6 py-4">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder={t('search.placeholder') || 'Search products...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full pl-12 pr-24 py-3 bg-gray-50 rounded-full border border-gray-200 focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 outline-none transition-all"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-default text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu - Portaled to body to avoid z-index/transform issues */}
            {createPortal(
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 bg-white z-9999 flex flex-col"
                        >
                            {/* Mobile Menu Header */}
                            <div className="container mx-auto px-4 md:px-6 py-6 flex items-center justify-between border-b border-gray-100">
                                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="text-xl font-logo text-brand-text">MyDermaLife</span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 -mr-2 text-brand-text hover:text-brand-default transition-colors"
                                >
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            {/* Mobile Menu Content */}
                            <div className="flex-1 overflow-y-auto py-8">
                                <div className="container mx-auto px-4 md:px-6 flex flex-col gap-6">
                                    <Link
                                        to="/"
                                        className="text-2xl font-serif font-medium text-brand-text hover:text-brand-default transition-colors hover:pl-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.home')}
                                    </Link>
                                    <Link
                                        to="/doctors"
                                        className="text-2xl font-serif font-medium text-brand-text hover:text-brand-default transition-colors hover:pl-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.doctors')}
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="text-2xl font-serif font-medium text-brand-text hover:text-brand-default transition-colors hover:pl-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.products')}
                                    </Link>
                                    <Link
                                        to="/benefits"
                                        className="text-2xl font-serif font-medium text-brand-text hover:text-brand-default transition-colors hover:pl-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {t('nav.approach')}
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsBookingWizardOpen(true);
                                        }}
                                        className="w-full bg-brand-default text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-brand-dark transition-all text-center"
                                    >
                                        {t('nav.getStarted')}
                                    </button>

                                    <hr className="border-gray-100 my-4" />

                                    <div className="space-y-4">
                                        {isAuthenticated ? (
                                            <>
                                                <Link to="/profile" className="flex items-center gap-3 text-lg font-medium text-brand-text hover:text-brand-default transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-default/10 border-2 border-brand-default flex items-center justify-center text-brand-default font-bold relative">
                                                        {user?.profile?.profilePhoto ? (
                                                            <img src={user.profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            user?.profile?.firstName?.[0]?.toUpperCase() || <User className="w-5 h-5" />
                                                        )}
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{user?.profile?.firstName} {user?.profile?.lastName}</span>
                                                        <span className="text-xs text-green-600 font-medium">{t('nav.myAccount')}</span>
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        logoutMutation.mutate();
                                                        setIsMobileMenuOpen(false);
                                                        navigate('/');
                                                    }}
                                                    className="flex items-center gap-3 text-lg font-medium text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                                        <LogOut className="w-5 h-5" />
                                                    </div>
                                                    <span>{t('profile.menu.logout')}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <Link to="/login" className="flex items-center gap-3 text-lg font-medium text-brand-muted hover:text-brand-text transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <LogIn className="w-5 h-5" />
                                                </div>
                                                <span>Connexion</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/cart"
                                            className="flex items-center gap-3 text-lg font-medium text-brand-muted hover:text-brand-text transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
                                                <ShoppingBag className="w-5 h-5" />
                                                {cartItemCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-brand-default text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                                        {cartItemCount}
                                                    </span>
                                                )}
                                            </div>
                                            <span>{t('nav.cart')} ({cartItemCount})</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
            {/* Global Booking Wizard */}
            <BookingWizard
                isOpen={isBookingWizardOpen}
                onClose={() => setIsBookingWizardOpen(false)}
            />
        </nav>
    );
}
