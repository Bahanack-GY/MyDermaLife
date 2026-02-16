import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowRight } from 'lucide-react';
import trustDoctor from '../assets/images/trust-doctor.webp'; // Re-using image for now or placeholder

export function FoundersSection() {
    const { t } = useTranslation();

    const doctors = [
        {
            name: 'Dr. Sarah N\'Diaye',
            specialties: 'Dermatologie Clinique & Esthétique',
            image: trustDoctor // Using placeholder, in real app would use specific images
        },
        {
            name: 'Dr. Jean-Marc Tambong',
            specialties: 'Spécialiste Peaux Mélaniques',
            image: trustDoctor
        }
    ];

    return (
        <section id="founders" className="py-24 bg-brand-light/30">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <span className="text-brand-default text-sm font-bold uppercase tracking-widest mb-2 block">{t('founders.sectionTag')}</span>
                <h2 className="text-3xl md:text-5xl font-serif font-medium text-brand-text mb-12">
                    {t('founders.sectionTitle')}
                </h2>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
                    {doctors.map((doctor, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-brand-light">
                                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-brand-text mb-1">{doctor.name}</h3>
                            <p className="text-sm text-brand-muted mb-3">{doctor.specialties}</p>

                            <div className="flex items-center gap-1.5 bg-brand-default/10 text-brand-default px-3 py-1 rounded-full">
                                <BadgeCheck className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wide">{t('founders.boardCertified')}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Link
                    to="/doctors"
                    className="inline-flex items-center gap-2 text-brand-dark font-medium border-b border-brand-dark pb-0.5 hover:text-brand-default hover:border-brand-default transition-colors"
                >
                    {t('founders.readStory')}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}

