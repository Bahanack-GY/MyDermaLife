import { useState } from 'react';
import { Eye, EyeOff, Stethoscope, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useLogin } from '../api/features/auth';
import { getErrorMessage } from '../api/client';
import axios from 'axios';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [error, setError] = useState<string | null>(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: () => {
                    navigate('/');
                },
                onError: (err) => {
                    console.error('Login failed:', err);
                    if (axios.isAxiosError(err) && err.response?.status === 401) {
                        setError(t('login.error.invalidCredentials'));
                    } else {
                        setError(getErrorMessage(err));
                    }
                }
            }
        );
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-end overflow-hidden">
            {/* Background Image - Full Screen */}
            <img 
                src="https://images.unsplash.com/photo-1666886573531-48d2e3c2b684?q=80&w=1170&auto=format&fit=crop" 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Overlay for contrast if needed, slightly dark to make the white card pop if overlapping, or just to tint the fun photo */}
            <div className="absolute inset-0 bg-black/10 z-0" />

            {/* Right Side - The Card/Form Area */}
            <div className="relative z-10 w-full max-w-[480px] m-4 lg:mr-24 p-8 lg:p-12 bg-white rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
                
                {/* Language Toggle */}
                <button 
                    onClick={toggleLanguage}
                    className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 font-sans font-medium text-sm flex items-center gap-2"
                >
                    <Globe className="w-4 h-4" />
                    {i18n.language === 'en' ? 'FR' : 'EN'}
                </button>

                <div className="w-full flex flex-col">
                    
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="flex items-center justify-center gap-2 mb-6 text-brand-default font-serif font-bold text-2xl tracking-tight">
                            <div className="w-8 h-8 bg-brand-default rounded-lg flex items-center justify-center text-white">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            MyDermaLife
                        </div>
                        <h1 className="text-[2.5rem] leading-tight font-serif font-bold text-gray-900 mb-2">
                           {t('login.title')}
                        </h1>
                        <p className="text-gray-500 font-sans">{t('login.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {/* Email Input */}
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand-default focus:ring-4 focus:ring-brand-default/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 font-sans font-medium"
                                placeholder={t('login.emailPlaceholder')}
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-brand-default focus:ring-4 focus:ring-brand-default/10 outline-none transition-all text-gray-800 placeholder:text-gray-400 font-sans font-medium"
                                placeholder={t('login.passwordPlaceholder')}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm font-sans font-semibold text-brand-default hover:text-brand-dark transition-colors">
                                {t('login.forgotPassword')}
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full bg-brand-default hover:bg-[#c38e5e] text-white font-sans font-bold py-4 rounded-2xl shadow-lg shadow-brand-default/20 hover:shadow-brand-default/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                        >
                            {loginMutation.isPending ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                            ) : (
                                t('login.submit')
                            )}
                        </button>
                    </form>

                    {/* Footer Terms */}
                    <p className="text-center text-gray-400 text-xs mt-10 leading-relaxed px-4 font-sans">
                        <Trans i18nKey="login.terms">
                            By logging in, you agree to our <Link to="#" className="text-brand-default hover:underline">Terms of Service</Link> and <Link to="#" className="text-brand-default hover:underline">Privacy Policy</Link>.
                        </Trans>
                    </p>

                    <div className="text-center mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-500 font-sans">
                             {t('login.needHelp')} <Link to="#" className="text-brand-default font-bold hover:underline">{t('login.contactSupport')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
