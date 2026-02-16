import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Video, ShoppingBag, ArrowRight } from 'lucide-react';

export function CTASection() {
    const { t } = useTranslation();

    return (
        <section className="py-24 bg-brand-light/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="bg-brand-default rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-dark/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                    <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight">
                            {t('finalCta.title')}
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/doctors"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-brand-default px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-soft hover:text-brand-dark transition-all shadow-lg hover:-translate-y-1 group"
                            >
                                <Video className="w-5 h-5" />
                                {t('finalCta.cta1')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/products"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-dark text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-dark/80 transition-all shadow-lg hover:-translate-y-1"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {t('finalCta.cta2')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
