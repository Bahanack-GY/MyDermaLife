
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { PageTransition } from '../components/PageTransition';
import { Hero } from '../components/Hero';
import { MedicalExpertsSection } from '../components/MedicalExpertsSection';
import { ProductsSection } from '../components/ProductsSection';
import { BenefitsSection } from '../components/BenefitsSection';
// import { ConditionsSection } from '../components/ConditionsSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { FoundersSection } from '../components/FoundersSection';
import { Footer } from '../components/Footer';
import { CTASection } from '../components/CTASection';
import { ShoppingBag, Video } from 'lucide-react';
import { BookingWizard } from '../components/BookingWizard';

export function HomePage() {
    const { t } = useTranslation();
    const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);

    return (
        <PageTransition>
            <div className="min-h-screen bg-white pb-20 md:pb-0">
                <Navbar />
                <Hero />
                <MedicalExpertsSection />
                <ProductsSection />
                <FoundersSection />
                <BenefitsSection />

                {/* <ConditionsSection /> */}
                <TestimonialsSection />
                <CTASection />
                <Footer />

                {/* Mobile Fixed Bottom CTA Buttons */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex gap-3 md:hidden z-50 shadow-lg">
                    <Link
                        to="/products"
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-default text-white py-3 rounded-full font-medium text-sm"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {t('cta.buyProduct')}
                    </Link>
                    <button
                        onClick={() => setIsBookingWizardOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-dark text-white py-3 rounded-full font-medium text-sm"
                    >
                        <Video className="w-4 h-4" />
                        {t('cta.consultOnline')}
                    </button>
                </div>

                <BookingWizard
                    isOpen={isBookingWizardOpen}
                    onClose={() => setIsBookingWizardOpen(false)}
                />
            </div>
        </PageTransition>
    );
}
