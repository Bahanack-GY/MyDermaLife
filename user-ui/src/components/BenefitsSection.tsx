import { BadgeCheck, Video, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BenefitsSection() {
    const { t } = useTranslation();

    const benefits = [
        {
            icon: BadgeCheck,
            titleKey: "benefits.pillar1Title",
            descKey: "benefits.pillar1Desc"
        },
        {
            icon: Video,
            titleKey: "benefits.pillar2Title",
            descKey: "benefits.pillar2Desc"
        },
        {
            icon: Sparkles,
            titleKey: "benefits.pillar3Title",
            descKey: "benefits.pillar3Desc"
        }
    ];

    return (
        <section id="benefits" className="py-20 bg-brand-light/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-2 block">{t('benefits.sectionTag')}</span>
                    <h2 className="text-3xl md:text-4xl font-serif font-medium text-brand-text">
                        {t('benefits.sectionTitle')}
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-white transition-all duration-300 group">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-default group-hover:text-white transition-all duration-300 text-brand-default">
                                <benefit.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-serif font-medium text-brand-text mb-3">{t(benefit.titleKey)}</h3>
                            <p className="text-brand-muted leading-relaxed">
                                {t(benefit.descKey)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

