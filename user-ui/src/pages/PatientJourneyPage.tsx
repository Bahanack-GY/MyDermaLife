import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { PackageCheck, ArrowRight, UserPlus, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function PatientJourneyPage() {
    const { t } = useTranslation();

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32 pb-16">
                    {/* Hero */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">{t('nav.approach')}</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-medium text-brand-text mb-6">
                            {t('patientJourney.title')}
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            {t('patientJourney.subtitle')}
                        </p>
                    </div>

                    {/* Timeline / Journey Steps */}
                    <div className="container mx-auto px-4 md:px-6 mb-24 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[100px] left-[20%] right-[20%] h-0.5 bg-brand-light/30 z-0"></div>

                        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative z-10">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-brand-light/10 border-4 border-white shadow-xl rounded-full flex items-center justify-center text-brand-default mb-8">
                                    <UserPlus className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-brand-text mb-4">{t('patientJourney.step1Title')}</h3>
                                <p className="text-brand-muted leading-relaxed mb-6">
                                    {t('patientJourney.step1Desc')}
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-brand-default text-white border-4 border-white shadow-xl rounded-full flex items-center justify-center mb-8">
                                    <Stethoscope className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-brand-text mb-4">{t('patientJourney.step2Title')}</h3>
                                <p className="text-brand-muted leading-relaxed mb-6">
                                    {t('patientJourney.step2Desc')}
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-brand-light/10 border-4 border-white shadow-xl rounded-full flex items-center justify-center text-brand-default mb-8">
                                    <PackageCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-brand-text mb-4">{t('patientJourney.step3Title')}</h3>
                                <p className="text-brand-muted leading-relaxed mb-6">
                                    {t('patientJourney.step3Desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link to="/doctors" className="inline-flex items-center gap-2 bg-brand-default text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-dark transition-all shadow-lg hover:shadow-xl">
                            {t('nav.getStarted')} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
