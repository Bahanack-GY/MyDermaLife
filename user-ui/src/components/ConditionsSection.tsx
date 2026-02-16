import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import acneImage from '../assets/images/condition-acne.webp';
import agingImage from '../assets/images/condition-aging.webp';
import rosaceaImage from '../assets/images/condition-rosacea.webp';
import melasmaImage from '../assets/images/condition-melasma.webp';

export function ConditionsSection() {
    const { t } = useTranslation();

    const conditions = [
        {
            id: 'acne',
            labelKey: 'conditions.acne',
            titleKey: 'conditions.acneTitle',
            descKey: 'conditions.acneDesc',
            color: 'bg-blue-50',
            imageColor: 'bg-blue-200',
            image: acneImage
        },
        {
            id: 'anti-aging',
            labelKey: 'conditions.antiAging',
            titleKey: 'conditions.antiAgingTitle',
            descKey: 'conditions.antiAgingDesc',
            color: 'bg-indigo-50',
            imageColor: 'bg-indigo-200',
            image: agingImage
        },
        {
            id: 'rosacea',
            labelKey: 'conditions.rosacea',
            titleKey: 'conditions.rosaceaTitle',
            descKey: 'conditions.rosaceaDesc',
            color: 'bg-green-50',
            imageColor: 'bg-green-200',
            image: rosaceaImage
        },
        {
            id: 'melasma',
            labelKey: 'conditions.melasma',
            titleKey: 'conditions.melasmaTitle',
            descKey: 'conditions.melasmaDesc',
            color: 'bg-orange-50',
            imageColor: 'bg-orange-200',
            image: melasmaImage
        }
    ];

    const [activeCondition, setActiveCondition] = useState(conditions[0]);

    return (
        <section id="conditions" className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">

                    {/* Left Side: Navigation */}
                    <div className="w-full md:w-1/3 space-y-8">
                        <div>
                            <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-2 block">{t('conditions.sectionTag')}</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-medium text-brand-text">
                                {t('conditions.sectionTitle')} <br />
                                {t('conditions.sectionTitle2')}
                            </h2>
                            <p className="text-brand-muted mt-4">
                                {t('conditions.sectionSubtitle')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            {conditions.map((condition) => (
                                <button
                                    key={condition.id}
                                    onClick={() => setActiveCondition(condition)}
                                    className={cn(
                                        "w-full text-left px-6 py-4 rounded-xl flex items-center justify-between transition-all duration-300",
                                        activeCondition.id === condition.id
                                            ? "bg-brand-light text-brand-dark font-medium shadow-sm translate-x-2"
                                            : "hover:bg-gray-50 text-brand-muted hover:text-brand-text"
                                    )}
                                >
                                    <span className="text-lg">{t(condition.labelKey)}</span>
                                    {activeCondition.id === condition.id && (
                                        <motion.div layoutId="active-arrow">
                                            <ArrowRight className="w-5 h-5 text-brand-default" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4">
                            <a href="#" className="inline-flex items-center gap-2 text-brand-default font-medium hover:underline">
                                {t('conditions.viewAllTreatments')} <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Right Side: Content & Visual */}
                    <div className="w-full md:w-2/3 relative min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCondition.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid lg:grid-cols-2 gap-8 h-full"
                            >
                                {/* Visual Card */}
                                <div className={cn(
                                    "rounded-3xl h-[400px] lg:h-[500px] w-full flex items-center justify-center relative overflow-hidden shadow-2xl",
                                    activeCondition.imageColor
                                )}>
                                    <img
                                        src={activeCondition.image}
                                        alt={t(activeCondition.labelKey)}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Info Card */}
                                <div className="flex flex-col justify-center lg:pl-4 space-y-6">
                                    <h3 className="text-3xl font-serif font-medium text-brand-text">{t(activeCondition.titleKey)}</h3>
                                    <p className="text-lg text-brand-muted leading-relaxed">
                                        {t(activeCondition.descKey)}
                                    </p>

                                    <div className="bg-brand-light/30 p-6 rounded-2xl border border-brand-soft/30">
                                        <h4 className="font-medium text-brand-dark mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-brand-default"></div>
                                            {t('conditions.whatToExpect')}
                                        </h4>
                                        <p className="text-sm text-brand-muted">
                                            {t('conditions.expectationText')}
                                        </p>
                                    </div>

                                    <button className="self-start bg-brand-text text-white px-8 py-3 rounded-full font-medium hover:bg-brand-default transition-colors shadow-lg">
                                        {t('conditions.startTreatment')}
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

