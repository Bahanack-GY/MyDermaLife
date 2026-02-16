import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import trustDoctor from '../assets/images/trust-doctor.webp';

export function TrustSection() {
    const { t } = useTranslation();

    const features = [
        t('trust.feature1'),
        t('trust.feature2'),
        t('trust.feature3')
    ];

    return (
        <section className="py-20 bg-brand-dark text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-default/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    <div className="space-y-8">
                        <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                            <span className="text-xs font-medium tracking-wide uppercase text-brand-soft">{t('trust.sectionTag')}</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-serif font-medium leading-tight">
                            {t('trust.title1')} <br />
                            <span className="text-brand-soft italic">{t('trust.title2')}</span>
                        </h2>

                        <p className="text-brand-light/80 text-lg leading-relaxed max-w-md">
                            {t('trust.subtitle')}
                        </p>

                        <ul className="space-y-4">
                            {features.map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand-default" />
                                    <span className="text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4">
                            <a href="#consultation" className="bg-white text-brand-dark px-8 py-4 rounded-full font-medium hover:bg-brand-soft transition-colors inline-block">
                                {t('trust.findTreatment')}
                            </a>
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[600px] rounded-[2.5rem] p-2 flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                        <img
                            src={trustDoctor}
                            alt={t('trust.doctorName')}
                            className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

                        <div className="absolute bottom-8 left-8 text-left z-10">
                            <p className="text-white text-xl font-serif italic mb-1">"{t('trust.doctorName')}"</p>
                            <p className="text-white/80 uppercase tracking-widest text-xs font-medium">{t('trust.doctorTitle')}</p>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute top-8 right-8 bg-brand-default/90 backdrop-blur text-white p-4 rounded-2xl shadow-xl max-w-[140px] text-center rotate-3 z-10 border border-white/20">
                            <span className="block text-2xl font-bold font-serif mb-1">100%</span>
                            <span className="text-xs">{t('trust.onlinePrescriptions')}</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

