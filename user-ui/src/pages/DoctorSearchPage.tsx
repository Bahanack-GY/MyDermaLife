import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { Search, MapPin, Filter, Star, Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState } from 'react';

import { Link } from 'react-router-dom';
import { useDoctors } from '../hooks/useDoctors';

import acneImg from '../assets/images/problem-acne.png';
import hyperpigmentationImg from '../assets/images/problem-hyperpigmentation.png';
import sensitiveImg from '../assets/images/problem-sensitive.png';
import eczemaImg from '../assets/images/problem-eczema.png';
import antiAgingImg from '../assets/images/problem-anti-aging.png';
import otherImg from '../assets/images/problem-other.png';

export function DoctorSearchPage() {
    const { t } = useTranslation();
    const { data: doctors, isLoading, error } = useDoctors();

    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

    const problems = [
        { title: "Acné", image: acneImg, tag: "Acné" },
        { title: "Taches & Hyperpigmentation", image: hyperpigmentationImg, tag: "Taches" },
        { title: "Peaux sensibles", image: sensitiveImg, tag: "Sensible" },
        { title: "Eczéma / Psoriasis", image: eczemaImg, tag: "Eczéma" },
        { title: "Anti-âge", image: antiAgingImg, tag: "Anti-âge" },
        { title: "Autres problèmes", image: otherImg, tag: "Général" }
    ];

    // Helper to format full name
    const getDoctorName = (doctor: any) => {
        return `Dr. ${doctor.user.profile.firstName} ${doctor.user.profile.lastName}`;
    };

    // Helper to get location
    const getDoctorLocation = (doctor: any) => {
        return doctor.user.profile.city || 'Unknown Location';
    };

    // Helper to get image
    const getDoctorImage = (doctor: any) => {
        return doctor.user.profile.profilePhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400";
    };

    // Filter doctors
    const filteredDoctors = (doctors || []).filter((doc: any) => {
        const matchesSearch = getDoctorName(doc).toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = getDoctorLocation(doc).toLowerCase().includes(locationTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty
            ? (doc.specialization?.includes(selectedSpecialty) || doc.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase()))
            : true;

        return matchesSearch && matchesLocation && matchesSpecialty;
    });

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50/50">
                <Navbar />

                <main className="pt-28 pb-16 container mx-auto px-4 md:px-6">
                    {/* Header & Search */}
                    <div className="max-w-6xl mx-auto mb-12">
                        <div className="text-center md:text-left mb-8">
                            <h1 className="text-3xl md:text-4xl font-serif font-medium text-brand-text mb-4">
                                {t('doctorsPage.title')}
                            </h1>
                            <p className="text-brand-muted">Trouvez le dermatologue expert pour votre besoin spécifique.</p>
                        </div>

                        {/* Search Bars */}
                        <div className="bg-white p-2 rounded-2xl shadow-lg flex flex-col md:flex-row gap-2 border border-gray-100 mb-10 max-w-4xl">
                            <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                                <Search className="w-5 h-5 text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder={t('doctorsPage.searchPlaceholder')}
                                    className="bg-transparent w-full outline-none text-brand-text placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder={t('doctorsPage.locationPlaceholder')}
                                    className="bg-transparent w-full outline-none text-brand-text placeholder:text-gray-400"
                                    value={locationTerm}
                                    onChange={(e) => setLocationTerm(e.target.value)}
                                />
                            </div>
                            <button className="bg-brand-default text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors">
                                {t('doctorsPage.searchButton')}
                            </button>
                        </div>

                        {/* Problems Category Grid (Filter) */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-serif font-bold text-brand-text">Par problématique</h2>
                                {selectedSpecialty && (
                                    <button
                                        onClick={() => setSelectedSpecialty(null)}
                                        className="text-sm font-medium text-red-500 flex items-center gap-1 hover:underline"
                                    >
                                        <X className="w-4 h-4" /> Effacer le filtre
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {problems.map((problem, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSpecialty(selectedSpecialty === problem.tag ? null : problem.tag)}
                                        className={`relative h-40 rounded-2xl overflow-hidden group shadow-sm transition-all text-left ${selectedSpecialty === problem.tag ? 'ring-4 ring-brand-default scale-105 shadow-xl' : 'hover:shadow-md'}`}
                                    >
                                        <img
                                            src={problem.image}
                                            alt={problem.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${selectedSpecialty === problem.tag ? 'opacity-90' : 'opacity-70 group-hover:opacity-80'}`}></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h3 className="text-sm font-bold text-white leading-tight">{problem.title}</h3>
                                            {selectedSpecialty === problem.tag && (
                                                <div className="mt-1 h-1 w-8 bg-brand-default rounded-full"></div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <aside className="hidden lg:block w-64 space-y-8">
                            <div>
                                <h3 className="font-bold text-brand-text mb-4 flex items-center gap-2">
                                    <Filter className="w-4 h-4" /> {t('doctorsPage.filters')}
                                </h3>
                                {/* Filter Groups Mockup */}
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <p className="font-medium mb-2 text-sm">{t('doctorsPage.availability')}</p>
                                        <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                            <input type="checkbox" className="rounded text-brand-default focus:ring-brand-default" /> {t('doctorsPage.today')}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input type="checkbox" className="rounded text-brand-default focus:ring-brand-default" /> {t('doctorsPage.next3Days')}
                                        </label>
                                    </div>

                                </div>
                            </div>
                        </aside>

                        {/* Results */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-500 text-sm"><strong>{filteredDoctors.length}</strong> {t('doctorsPage.resultsFound')} Douala</p>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-20 bg-white rounded-3xl">
                                    <div className="w-10 h-10 border-4 border-brand-default border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-400">Recherche des médecins...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 bg-white rounded-3xl">
                                    <p className="text-red-500">Une erreur est survenue lors du chargement des médecins.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredDoctors.length > 0 ? (
                                        filteredDoctors.map((doctor: any) => (
                                            <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="block bg-white p-4 md:p-6 rounded-2xl border border-gray-100 transition-all duration-300 group">
                                                <div className="flex gap-4 md:gap-6">
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0">
                                                        <img src={getDoctorImage(doctor)} alt={getDoctorName(doctor)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                            <div>
                                                                <h3 className="text-lg md:text-xl font-serif font-bold text-brand-text mb-1">{getDoctorName(doctor)}</h3>
                                                                <p className="text-brand-muted text-sm mb-2">{doctor.specialization}</p>
                                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {getDoctorLocation(doctor)}</span>
                                                                    <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-3 h-3 fill-current" /> {doctor.rating || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-left sm:text-right mt-1 sm:mt-0">
                                                                <p className="font-bold text-brand-text">{doctor.consultationFee} FCFA</p>
                                                                <span className="text-xs text-brand-muted">{t('doctorsPage.videoConsultation')}</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {doctor.specialization?.split(',').map((tag: string, i: number) => (
                                                                    <span key={i} className="px-2 py-1 bg-brand-light/30 text-brand-dark text-xs rounded-md">{tag.trim()}</span>
                                                                ))}
                                                            </div>
                                                            <div className="self-start sm:self-auto flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {t('doctorsPage.next')}: Today
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                            <p className="text-brand-muted">Aucun médecin trouvé pour ces critères.</p>
                                            <button
                                                onClick={() => { setSelectedSpecialty(null); setSearchTerm(''); setLocationTerm(''); }}
                                                className="mt-4 text-brand-default font-bold hover:underline"
                                            >
                                                Voir tous les médecins
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Map View */}
                        <div className="hidden lg:block w-1/3 sticky top-40 h-[600px] rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
                            <APIProvider apiKey="AIzaSyAHwXJxvDg9jK_nDrxz9hxd0_fQ1greZKo">
                                <Map
                                    defaultCenter={{ lat: 4.0511, lng: 9.7679 }}
                                    defaultZoom={12}
                                    gestureHandling="greedy"
                                    disableDefaultUI={false}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    {filteredDoctors.map((doctor: any) => {
                                        const lat = doctor.user?.profile?.lat;
                                        const lng = doctor.user?.profile?.lng;
                                        if (!lat || !lng) return null;
                                        return (
                                            <AdvancedMarker
                                                key={doctor.id}
                                                position={{ lat, lng }}
                                                title={getDoctorName(doctor)}
                                            />
                                        );
                                    })}
                                </Map>
                            </APIProvider>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}
