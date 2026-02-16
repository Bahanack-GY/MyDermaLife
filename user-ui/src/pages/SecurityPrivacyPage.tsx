import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Lock, Shield, Server, FileLock, EyeOff, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SecurityPrivacyPage() {
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">{t('security.tag')}</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-brand-text mb-6">
                            {t('security.title')}
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            {t('security.subtitle')}
                        </p>
                    </div>

                    {/* Security Grid */}
                    <div className="container mx-auto px-4 md:px-6 mb-24 max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 border border-gray-100 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                <Server className="w-10 h-10 text-brand-default mb-6" />
                                <h3 className="text-xl font-bold text-brand-text mb-3">{t('security.hdsTitle')}</h3>
                                <p className="text-brand-muted leading-relaxed">
                                    {t('security.hdsDesc')}
                                </p>
                            </div>

                            <div className="p-8 border border-gray-100 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                <Lock className="w-10 h-10 text-brand-default mb-6" />
                                <h3 className="text-xl font-bold text-brand-text mb-3">{t('security.encryptionTitle')}</h3>
                                <p className="text-brand-muted leading-relaxed">
                                    {t('security.encryptionDesc')}
                                </p>
                            </div>

                            <div className="p-8 border border-gray-100 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                <EyeOff className="w-10 h-10 text-brand-default mb-6" />
                                <h3 className="text-xl font-bold text-brand-text mb-3">{t('security.secrecyTitle')}</h3>
                                <p className="text-brand-muted leading-relaxed">
                                    {t('security.secrecyDesc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Legal Framework */}
                    <div className="bg-gray-50 py-20">
                        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-serif font-medium text-brand-text mb-4">{t('security.legalTitle')}</h2>
                                    <p className="text-brand-muted mb-6">
                                        {t('security.legalDesc')}
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-brand-dark">{t('security.compliance')}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileLock className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-brand-dark">{t('security.accessRights')}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-brand-dark">{t('security.audits')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <Shield className="w-48 h-48 text-brand-default/10" strokeWidth={1} />
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
