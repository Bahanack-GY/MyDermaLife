import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCountry } from '../hooks/useCountry';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { MapPin, Loader2 } from 'lucide-react';

interface CountryGateProps {
  children: React.ReactNode;
}

export function CountryGate({ children }: CountryGateProps) {
  const { t } = useTranslation();
  const { country, isLoading, isAllowed } = useCountry();

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="flex items-center justify-center pt-40 pb-16">
            <Loader2 className="w-8 h-8 text-brand-default animate-spin" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!isAllowed) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
              <div className="bg-brand-light/30 rounded-3xl p-10 md:p-16">
                <div className="w-20 h-20 bg-brand-default/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MapPin className="w-10 h-10 text-brand-default" />
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-medium text-brand-text mb-4">
                  {t('countryGate.title')}
                </h1>
                <p className="text-brand-muted text-lg mb-3">
                  {t('countryGate.message')}
                </p>
                {country && (
                  <p className="text-brand-muted text-sm mb-8">
                    {t('countryGate.detectedCountry')}: <span className="font-medium text-brand-text">{country}</span>
                  </p>
                )}
                <p className="text-brand-muted text-sm mb-10">
                  {t('countryGate.availableIn')}
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-brand-default text-white px-8 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors"
                >
                  {t('countryGate.backHome')}
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return <>{children}</>;
}
