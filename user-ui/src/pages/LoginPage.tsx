import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/PageTransition';
import { useLogin, useRegister } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User as UserIcon, Phone, Calendar, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { getErrorMessage } from '../api/client';
import type { RegisterData } from '../api/types';

type TabType = 'login' | 'signup';

export function LoginPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>('login');
    const [showPassword, setShowPassword] = useState(false);
    
    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    // Signup state
    const [signupData, setSignupData] = useState<RegisterData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: undefined,
    });

    const loginMutation = useLogin();
    const registerMutation = useRegister();

    // Get the page they were trying to access, or default to profile
    const from = (location.state as any)?.from?.pathname || '/profile';

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loginEmail || !loginPassword) {
            toast.error(t('auth.fillAllFields'));
            return;
        }

        try {
            await loginMutation.mutateAsync({ email: loginEmail, password: loginPassword });
            toast.success(t('auth.loginSuccess'));
            navigate(from, { replace: true });
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName) {
            toast.error(t('auth.fillRequiredFields'));
            return;
        }

        // Password validation
        if (signupData.password.length < 8) {
            toast.error(t('auth.passwordTooShort'));
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signupData.password)) {
            toast.error(t('auth.passwordWeak'));
            return;
        }

        try {
            await registerMutation.mutateAsync(signupData);
            toast.success(t('auth.signupSuccess'));
            navigate(from, { replace: true });
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.error(errorMessage);
        }
    };

    const updateSignupData = (field: keyof RegisterData, value: any) => {
        setSignupData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <PageTransition>
            <div 
                className="min-h-screen flex items-center justify-end p-8 bg-cover bg-center relative"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1543366749-4dad497ea0a0?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
                }}
            >
                {/* Overlay for better readability */}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                    title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
                >
                    <Globe className="w-4 h-4 text-brand-dark" />
                    <span className="uppercase font-bold text-sm text-brand-dark">{i18n.language}</span>
                </button>
                
                <div className="w-full max-w-md relative z-10">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-serif font-bold text-white mb-2 drop-shadow-lg">
                            {t('auth.brandName')}
                        </h1>
                        <p className="text-white/90 drop-shadow">
                            {activeTab === 'login' ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={cn(
                                    "flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-all",
                                    activeTab === 'login'
                                        ? "bg-brand-dark text-white"
                                        : "bg-white text-gray-400 hover:text-brand-dark"
                                )}
                            >
                                {t('auth.loginTab')}
                            </button>
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={cn(
                                    "flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-all",
                                    activeTab === 'signup'
                                        ? "bg-brand-dark text-white"
                                        : "bg-white text-gray-400 hover:text-brand-dark"
                                )}
                            >
                                {t('auth.signupTab')}
                            </button>
                        </div>

                        <div className="p-8">
                            {activeTab === 'login' ? (
                                /* LOGIN FORM */
                                <form onSubmit={handleLogin} className="space-y-6">
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                            {t('auth.email')}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                placeholder={t('auth.emailPlaceholder')}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark"
                                                disabled={loginMutation.isPending}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                            {t('auth.password')}
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                placeholder={t('auth.passwordPlaceholder')}
                                                className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark"
                                                disabled={loginMutation.isPending}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loginMutation.isPending}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                                            loginMutation.isPending
                                                ? "bg-gray-300 cursor-not-allowed"
                                                : "bg-brand-dark hover:bg-brand-default shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        )}
                                    >
                                        {loginMutation.isPending ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {t('auth.loggingIn')}
                                            </>
                                        ) : (
                                            <>
                                                {t('auth.loginButton')}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* SIGNUP FORM */
                                <form onSubmit={handleSignup} className="space-y-5">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                                {t('auth.firstName')} {t('auth.requiredField')}
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={signupData.firstName}
                                                    onChange={(e) => updateSignupData('firstName', e.target.value)}
                                                    placeholder={t('auth.firstNamePlaceholder')}
                                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                    disabled={registerMutation.isPending}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                                {t('auth.lastName')} {t('auth.requiredField')}
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={signupData.lastName}
                                                    onChange={(e) => updateSignupData('lastName', e.target.value)}
                                                    placeholder={t('auth.lastNamePlaceholder')}
                                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                    disabled={registerMutation.isPending}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                            {t('auth.email')} {t('auth.requiredField')}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={signupData.email}
                                                onChange={(e) => updateSignupData('email', e.target.value)}
                                                placeholder={t('auth.emailPlaceholder')}
                                                className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                disabled={registerMutation.isPending}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                            {t('auth.password')} {t('auth.requiredField')}
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={signupData.password}
                                                onChange={(e) => updateSignupData('password', e.target.value)}
                                                placeholder={t('auth.passwordPlaceholder')}
                                                className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                disabled={registerMutation.isPending}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {t('auth.passwordRequirements')}
                                        </p>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                            {t('auth.phone')}
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={signupData.phone}
                                                onChange={(e) => updateSignupData('phone', e.target.value)}
                                                placeholder={t('auth.phonePlaceholder')}
                                                className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                disabled={registerMutation.isPending}
                                            />
                                        </div>
                                    </div>

                                    {/* Date of Birth & Gender */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                                {t('auth.dateOfBirth')}
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={signupData.dateOfBirth}
                                                    onChange={(e) => updateSignupData('dateOfBirth', e.target.value)}
                                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                    disabled={registerMutation.isPending}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                                                {t('auth.gender')}
                                            </label>
                                            <select
                                                value={signupData.gender || ''}
                                                onChange={(e) => updateSignupData('gender', e.target.value as any)}
                                                className="w-full px-3 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark text-sm"
                                                disabled={registerMutation.isPending}
                                            >
                                                <option value="">{t('auth.genderSelect')}</option>
                                                <option value="male">{t('auth.genderMale')}</option>
                                                <option value="female">{t('auth.genderFemale')}</option>
                                                <option value="other">{t('auth.genderOther')}</option>
                                                <option value="prefer_not_to_say">{t('auth.genderPreferNot')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={registerMutation.isPending}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mt-6",
                                            registerMutation.isPending
                                                ? "bg-gray-300 cursor-not-allowed"
                                                : "bg-brand-dark hover:bg-brand-default shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                        )}
                                    >
                                        {registerMutation.isPending ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {t('auth.signingUp')}
                                            </>
                                        ) : (
                                            <>
                                                {t('auth.signupButton')}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-6">
                        <Link
                            to="/"
                            className="text-sm text-white/80 hover:text-white transition-colors drop-shadow"
                        >
                            {t('auth.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
