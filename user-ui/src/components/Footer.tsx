import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-brand-dark text-white py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-logo text-white mb-4 block">
                            MyDermaLife<span className="text-brand-soft">.</span>
                        </Link>
                        <p className="text-brand-light/80 text-sm leading-relaxed">
                            {t('footer.brandDesc')}
                        </p>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-serif font-medium text-lg mb-4 text-brand-soft">{t('footer.shop')}</h4>
                        <ul className="space-y-2 text-sm text-brand-light/70">
                            <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.allProducts')}</Link></li>
                            <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.treatments')}</Link></li>
                            <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.skincare')}</Link></li>
                            <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.newArrivals')}</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-serif font-medium text-lg mb-4 text-brand-soft">{t('footer.company')}</h4>
                        <ul className="space-y-2 text-sm text-brand-light/70">
                            <li><Link to="/benefits" className="hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
                            <li><Link to="/doctors" className="hover:text-white transition-colors">{t('footer.ourDermatologists')}</Link></li>
                            <li><Link to="/benefits" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
                            <li><Link to="/benefits" className="hover:text-white transition-colors">{t('footer.contactUs')}</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-serif font-medium text-lg mb-4 text-brand-soft">{t('footer.support')}</h4>
                        <ul className="space-y-2 text-sm text-brand-light/70">
                            <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.shipping')}</Link></li>
                            <li><Link to="/products" className="hover:text-white transition-colors">{t('footer.returns')}</Link></li>
                            <li><Link to="/benefits" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
                            <li><Link to="/benefits" className="hover:text-white transition-colors">{t('footer.contactUs')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-light/40">
                    <p>&copy; {new Date().getFullYear()} MyDermaLife. {t('footer.copyright')}</p>
                    <div className="flex gap-6">
                        <Link to="/benefits" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/benefits" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

