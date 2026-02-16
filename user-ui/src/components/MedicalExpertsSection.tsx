import { Link } from 'react-router-dom';
import { Video, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function MedicalExpertsSection() {
    const { t } = useTranslation();

    const steps = [
        { icon: Calendar, textKey: 'medicalExperts.steps.step1', number: '01' },
        { icon: Video, textKey: 'medicalExperts.steps.step2', number: '02' },
        { icon: Sparkles, textKey: 'medicalExperts.steps.step3', number: '03' }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-brand-dark via-brand-default to-brand-dark text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-soft/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                        <span className="text-xs font-medium tracking-wide uppercase text-white">{t('medicalExperts.sectionTag')}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-medium leading-tight mb-6">
                        {t('medicalExperts.title')}
                    </h2>
                    <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                        {t('medicalExperts.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -top-4 text-9xl font-serif font-bold text-white/5 select-none pointer-events-none">
                                {step.number}
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-brand-soft mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-medium leading-relaxed max-w-[200px]">
                                    {t(step.textKey)}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        to="/doctors"
                        className="inline-flex items-center gap-3 bg-white text-brand-dark px-10 py-4 rounded-full font-medium hover:bg-brand-soft transition-all shadow-xl hover:-translate-y-1 group"
                    >
                        {t('medicalExperts.cta')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
