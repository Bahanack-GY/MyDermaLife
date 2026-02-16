import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { ShieldCheck, Brain, Microscope, HeartHandshake } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export function BenefitsPage() {
    const { t } = useTranslation();

    const sections = [
        {
            key: 'founders',
            icon: HeartHandshake,
            bgColor: 'bg-white'
        },
        {
            key: 'clinical',
            icon: Microscope,
            bgColor: 'bg-brand-light/20'
        },
        {
            key: 'promise',
            icon: ShieldCheck,
            bgColor: 'bg-white'
        },
        {
            key: 'vision',
            icon: Brain,
            bgColor: 'bg-brand-dark',
            dark: true
        }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 md:pt-32">
                    {/* Page Header */}
                    <div className="container mx-auto px-4 md:px-6 mb-20 text-center max-w-4xl">
                        <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-4 block">{t('about.pageTag')}</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-medium text-brand-text mb-6 leading-tight">
                            {t('about.pageTitle')}
                        </h1>
                        <p className="text-brand-muted text-xl leading-relaxed">
                            {t('about.pageSubtitle')}
                        </p>
                    </div>

                    {/* Content Sections */}
                    {sections.map((section, index) => (
                        <section key={index} className={`py-20 md:py-24 ${section.bgColor} ${section.dark ? 'text-white' : 'text-brand-text'}`}>
                            <div className="container mx-auto px-4 md:px-6">
                                <div className={`flex flex-col md:flex-row gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

                                    {/* Icon/Visual Area */}
                                    <div className="flex-1 flex justify-center">
                                        <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center text-6xl shadow-xl ${section.dark ? 'bg-white/10 text-white border-4 border-white/20' : 'bg-white text-brand-default border-4 border-brand-light'}`}>
                                            <section.icon className="w-16 h-16 md:w-24 md:h-24" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 text-center md:text-left space-y-6">
                                        <h2 className={`text-3xl md:text-4xl font-serif font-medium ${section.dark ? 'text-white' : 'text-brand-text'}`}>
                                            {t(`about.sections.${section.key}.title`)}
                                        </h2>
                                        <p className={`text-lg leading-relaxed ${section.dark ? 'text-white/80' : 'text-brand-muted'}`}>
                                            {t(`about.sections.${section.key}.content`)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
