import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Wallet, CalendarX, FileCheck, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function PricingReimbursementPage() {
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">{t('pricing.tag')}</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-brand-text mb-6">
                            {t('pricing.title')}
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            {t('pricing.subtitle')}
                        </p>
                    </div>

                    {/* Pricing Card */}
                    <div className="container mx-auto px-4 md:px-6 mb-24">
                        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                            <div className="bg-brand-dark text-white p-10 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-default/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

                                <h3 className="text-2xl font-serif font-bold mb-2">{t('pricing.consultationTitle')}</h3>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-bold text-brand-default">{t('pricing.price')}</span>
                                    <span className="text-xl text-white/60">{t('pricing.currency')}</span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-brand-default/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-brand-default" />
                                        </div>
                                        <span>{t('pricing.feature1')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-brand-default/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-brand-default" />
                                        </div>
                                        <span>{t('pricing.feature2')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-brand-default/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-brand-default" />
                                        </div>
                                        <span>{t('pricing.feature3')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-brand-default/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-brand-default" />
                                        </div>
                                        <span>{t('pricing.feature4')}</span>
                                    </li>
                                </ul>

                                <Link to="/consultation" className="block w-full bg-white text-brand-dark text-center font-bold py-4 rounded-full hover:bg-brand-default hover:text-white transition-all">
                                    {t('pricing.bookBtn')}
                                </Link>
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                                        <Wallet className="w-6 h-6 text-brand-default" />
                                        {t('pricing.paymentTitle')}
                                    </h3>
                                    <p className="text-brand-muted mb-4">
                                        {t('pricing.paymentDesc')}
                                    </p>
                                    <div className="flex gap-4">
                                        <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 font-medium">Orange Money</span>
                                        <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 font-medium">MTN MoMo</span>
                                        <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 font-medium">Visa / MC</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                                        <FileCheck className="w-6 h-6 text-brand-default" />
                                        {t('pricing.insuranceTitle')}
                                    </h3>
                                    <p className="text-brand-muted">
                                        {t('pricing.insuranceDesc')}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                                        <CalendarX className="w-6 h-6 text-brand-default" />
                                        {t('pricing.cancellationTitle')}
                                    </h3>
                                    <p className="text-brand-muted">
                                        {t('pricing.cancellationDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
