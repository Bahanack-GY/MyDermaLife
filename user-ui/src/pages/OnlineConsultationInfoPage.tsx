import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Video, Clock, Wifi, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function OnlineConsultationInfoPage() {
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">{t('onlineConsultation.title')}</span>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-brand-text mb-6">
                            L'excellence médicale chez vous
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            {t('onlineConsultation.subtitle')}
                        </p>
                    </div>

                    {/* How it works - Operational */}
                    <div className="container mx-auto px-4 md:px-6 mb-24 max-w-5xl">
                        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                            <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100">
                                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-3">
                                    <Video className="w-6 h-6 text-brand-default" />
                                    {t('onlineConsultation.howItWorksTitle')}
                                </h3>
                                <p className="text-brand-muted mb-6 leading-relaxed">
                                    La consultation se déroule via notre interface vidéo sécurisée. Votre médecin :
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-brand-default rounded-full mt-2"></div>
                                        <span className="text-brand-text">{t('onlineConsultation.step3')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-brand-default rounded-full mt-2"></div>
                                        <span className="text-brand-text">Vous questionne sur vos antécédents et votre routine actuelle.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-brand-default rounded-full mt-2"></div>
                                        <span className="text-brand-text">{t('onlineConsultation.step4')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">{t('onlineConsultation.requirementsTitle')}</h3>
                                <ul className="space-y-6">
                                    <li className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-brand-dark flex-shrink-0">
                                            <Wifi className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg block">{t('onlineConsultation.req2')}</span>
                                            <span className="text-brand-muted text-sm">Wifi ou 4G stable pour la vidéo.</span>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-brand-dark flex-shrink-0">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg block">20 minutes de calme</span>
                                            <span className="text-brand-muted text-sm">{t('onlineConsultation.req3')}</span>
                                        </div>
                                    </li>
                                </ul>

                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <span className="font-bold text-brand-default flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4" /> Durée moyenne
                                    </span>
                                    <p className="text-2xl font-serif font-bold text-brand-dark">20 minutes</p>
                                    <p className="text-brand-muted text-sm">Suffisant pour un bilan complet.</p>
                                </div>
                            </div>
                        </div>

                        {/* After consultation */}
                        <div className="bg-brand-default/5 rounded-3xl p-10 md:p-16 text-center">
                            <h3 className="text-3xl font-serif font-bold text-brand-dark mb-8">{t('onlineConsultation.afterTitle')}</h3>
                            <div className="grid md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-default/10">
                                    <FileText className="w-8 h-8 text-brand-default mb-4" />
                                    <h4 className="font-bold text-lg mb-2">{t('onlineConsultation.after1')} & {t('onlineConsultation.after2')}</h4>
                                    <p className="text-sm text-brand-muted">Disponibles immédiatement dans votre espace patient sécurisé.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-default/10">
                                    <ShieldCheck className="w-8 h-8 text-brand-default mb-4" />
                                    <h4 className="font-bold text-lg mb-2">{t('onlineConsultation.after4')}</h4>
                                    <p className="text-sm text-brand-muted">Votre médecin reste disponible pour ajuster le traitement si nécessaire.</p>
                                </div>
                            </div>
                            <div className="mt-12">
                                <Link to="/consultation" className="bg-brand-default text-white px-8 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors inline-block">
                                    {t('nav.getStarted')}
                                </Link>
                            </div>
                        </div>
                    </div>

                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
