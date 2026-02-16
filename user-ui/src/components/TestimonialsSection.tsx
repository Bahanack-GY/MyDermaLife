import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export function TestimonialsSection() {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            nameKey: 'testimonials.name1',
            roleKey: 'testimonials.role1',
            quoteKey: 'testimonials.quote1',
            rating: 5,
            image: null
        },
        {
            id: 2,
            nameKey: 'testimonials.name2',
            roleKey: 'testimonials.role2',
            quoteKey: 'testimonials.quote2',
            rating: 5,
            image: null
        },
        {
            id: 3,
            nameKey: 'testimonials.name3',
            roleKey: 'testimonials.role3',
            quoteKey: 'testimonials.quote3',
            rating: 5,
            image: null
        }
    ];

    // Auto-slide every 6 seconds on mobile
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <section className="py-24 bg-brand-light/20">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-2 block">
                        {t('testimonials.sectionTag')}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-medium text-brand-text mb-4">
                        {t('testimonials.sectionTitle')}
                    </h2>
                    <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                        {t('testimonials.sectionSubtitle')}
                    </p>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-brand-text text-lg leading-relaxed mb-6 italic">
                                "{t(testimonial.quoteKey)}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-brand-default font-serif font-bold text-lg">
                                    {t(testimonial.nameKey).charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-brand-text">{t(testimonial.nameKey)}</p>
                                    <p className="text-sm text-brand-muted">{t(testimonial.roleKey)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile: Slider */}
                <div className="md:hidden relative overflow-hidden">
                    <div className="relative h-[320px]">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={activeIndex}
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.4 },
                                    scale: { duration: 0.4 }
                                }}
                                className="absolute inset-0"
                            >
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-current text-amber-400" />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className="text-brand-text text-lg leading-relaxed mb-6 italic">
                                        "{t(testimonials[activeIndex].quoteKey)}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center text-brand-default font-serif font-bold text-lg">
                                            {t(testimonials[activeIndex].nameKey).charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-brand-text">{t(testimonials[activeIndex].nameKey)}</p>
                                            <p className="text-sm text-brand-muted">{t(testimonials[activeIndex].roleKey)}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                                        ? 'w-6 bg-brand-default'
                                        : 'bg-brand-muted/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
                {/* Stats Option */}
                <div className="mt-16 border-t border-brand-dark/10 pt-12">
                    <div className="grid grid-cols-2 max-w-2xl mx-auto gap-8 text-center">
                        <div>
                            <p className="text-4xl font-serif text-brand-default font-bold mb-2">2 000+</p>
                            <p className="text-brand-muted text-sm uppercase tracking-widest">{t('testimonials.stats.patients')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-serif text-brand-default font-bold mb-2">5 000+</p>
                            <p className="text-brand-muted text-sm uppercase tracking-widest">{t('testimonials.stats.consultations')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

