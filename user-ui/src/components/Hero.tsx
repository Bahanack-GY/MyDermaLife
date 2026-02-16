import { Link } from 'react-router-dom';
import { ArrowRight, Video, ShieldCheck, Award, Sparkles, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import trustDoctor from '../assets/images/trust-doctor.webp';

export function Hero() {
    const { t } = useTranslation();

    return (
        <section className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden bg-brand-light/30">
            {/* Background Decor - mimicking the soft swooshes in the inspiration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-soft/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0" />

            <div className="container mx-auto px-4 md:px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="text-center md:text-left space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-brand-text leading-[1.1]">
                        {t('hero.title')}
                    </h1>

                    <p className="text-lg text-brand-muted max-w-lg mx-auto md:mx-0 leading-relaxed text-balance">
                        {t('hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                        <Link to="/doctors" className="group flex items-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full font-medium hover:bg-brand-default transition-all shadow-lg hover:-translate-y-0.5 min-w-[200px] justify-center">
                            <Video className="w-5 h-5" />
                            {t('hero.ctaPrimary')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/products" className="group flex items-center gap-2 bg-white text-brand-dark border-2 border-brand-light px-8 py-4 rounded-full font-medium hover:border-brand-default hover:text-brand-default transition-all shadow-sm min-w-[200px] justify-center">
                            {t('hero.ctaSecondary')}
                        </Link>
                    </div>

                    <div className="pt-8 flex flex-wrap items-center justify-center md:justify-start gap-8">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-soft/30 rounded-full text-brand-default">
                                <Award className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-brand-muted max-w-[100px] leading-tight">{t('hero.features.certified')}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-soft/30 rounded-full text-brand-default">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-brand-muted max-w-[100px] leading-tight">{t('hero.features.secure')}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-soft/30 rounded-full text-brand-default">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-brand-muted max-w-[120px] leading-tight">{t('hero.features.selected')}</p>
                        </div>
                    </div>
                </div>

                {/* Visual Content - Doctor Image */}
                <div className="relative h-[500px] md:h-[700px] w-full animate-in zoom-in-95 duration-1000 fade-in delay-200">
                    {/* Doctor Image */}
                    <div className="absolute inset-0 rounded-4xl overflow-hidden shadow-2xl border-4 border-white">
                        <img
                            src={trustDoctor}
                            alt="Dermatologue certifié MyDermaLife"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-brand-dark/40 to-transparent"></div>
                    </div>

                    {/* Floating Doctor Info Card */}
                    <div className="absolute bottom-12 left-0 md:-left-12 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 max-w-[280px] animate-in slide-in-from-right-8 duration-1000 delay-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-brand-default/10 rounded-full flex items-center justify-center text-brand-default">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-brand-text">Dr. Muyang & Dr. Tambong</p>
                                <p className="text-xs text-brand-muted">Dermatologues Certifiés</p>
                            </div>
                        </div>
                        <p className="text-xs text-brand-muted italic leading-relaxed">
                            "Consultation en ligne disponible 7j/7. Diagnostic professionnel et prescriptions adaptées."
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-brand-muted">Disponible maintenant</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Certification Badge */}
                    <div className="absolute top-8 right-8 bg-brand-dark/90 backdrop-blur text-white p-4 rounded-2xl shadow-xl max-w-[140px] text-center rotate-3 z-10 border border-white/20">
                        <span className="block text-2xl font-bold font-serif mb-1">100%</span>
                        <span className="text-xs">Certifiés & Agréés</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

