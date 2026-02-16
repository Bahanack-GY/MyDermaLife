import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';
import { MapPin, Video, Award, Clock, Calendar, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { cn } from '../lib/utils';

import { useParams, Link } from 'react-router-dom';
import { useDoctor, useBookedSlots } from '../hooks/useDoctors';
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isBefore, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookingWizard } from '../components/BookingWizard';

import { generateTimeSlots } from '../lib/slots';

export function DoctorProfilePage() {
    const { id } = useParams();
    const { data: doctor, isLoading, error } = useDoctor(id!);
    
    // Booking Widget State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [visitType] = useState<'video' | 'cabinet'>('video');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);

    // Booked slots hook needs to be at the top level
    const { data: bookedSlots } = useBookedSlots(id, selectedDate);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-default"></div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Médecin non trouvé</h2>
                    <p className="text-gray-500 mb-6">Le profil que vous recherchez n'existe pas ou n'est plus disponible.</p>
                    <Link to="/doctors" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-default hover:bg-brand-dark transition-colors w-full">
                        Retour aux médecins
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare data for UI (using fallback/defaults if fields are missing)
    // Note: Backend Doctor entity might not have lat/lng yet, using defaults for map
    // Note: Backend might not return a 'location' string, constructing from city/country or using a fallback
    const doctorLocation = doctor.user.profile.city 
        ? `${doctor.user.profile.city}, ${doctor.user.profile.country || ''}`
        : "Douala, Cameroun"; // Fallback
    
    const doctorImage = doctor.user.profile.profilePhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300";
    const doctorName = `Dr. ${doctor.user.profile.firstName} ${doctor.user.profile.lastName}`;

    const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });
    const today = startOfToday();

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Dynamic slots based on availability
    // Dynamic slots based on availability
    const slots = generateTimeSlots(doctor.availability, selectedDate, bookedSlots || []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                <Navbar />

                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 md:px-6">
                        {/* Header Card */}
                        <div className="bg-brand-light/30 rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-lg shrink-0">
                                <img src={doctorImage} alt={doctorName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-serif font-medium text-brand-text mb-2">{doctorName}</h1>
                                        <div className="flex items-center gap-2 text-brand-default font-medium">
                                            <Award className="w-5 h-5" />
                                            {doctor.specialization}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-bold text-brand-text">{doctor.consultationFee} FCFA</span>
                                        <span className="text-sm text-brand-muted">par consultation</span>
                                        <button 
                                            onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="hidden lg:block mt-2 px-4 py-2 bg-brand-default text-white text-sm font-bold rounded-lg hover:bg-brand-dark transition-colors"
                                        >
                                            Réserver maintenant
                                        </button>
                                    </div>
                                </div>

                                <p className="text-brand-muted leading-relaxed max-w-3xl mb-6">
                                    {doctor.bio}
                                </p>

                                <div className="flex flex-wrap gap-6 text-sm text-brand-text">
                                    <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100">
                                        <MapPin className="w-4 h-4 text-brand-default" /> {doctorLocation}
                                    </span>
                                    <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100">
                                        <Clock className="w-4 h-4 text-brand-default" /> {doctor.yearsOfExperience} ans d'expérience
                                    </span>
                                    <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100">
                                        <Video className="w-4 h-4 text-brand-default" /> Téléconsultation disponible
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Left: Details */}
                            <div className="lg:col-span-2 space-y-12">
                                {/* Expertise */}
                                <section>
                                    <h3 className="text-xl font-serif font-medium text-brand-text mb-4 border-b border-gray-100 pb-2">Expertise & Actes</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {/* Fallback expertise tags if none in DB, or parse if string */}
                                        {["Consultation Dermatologie", "Traitement de l'acné", "Suivi mélanome", "Peeling superficiel", "Dermatoscopie"].map(item => (
                                            <div key={item} className="flex items-center gap-2 text-brand-muted">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-default"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Education */}
                                <section>
                                    <h3 className="text-xl font-serif font-medium text-brand-text mb-4 border-b border-gray-100 pb-2">Formation</h3>
                                    <ul className="space-y-3">
                                        {doctor.education && Array.isArray(doctor.education) ? doctor.education.map((edu: any, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-brand-muted">
                                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                                {typeof edu === 'string' ? edu : edu.degree || 'Formation médicale'}
                                            </li>
                                        )) : (
                                            <li className="text-brand-muted italic">Non spécifié</li>
                                        )}
                                    </ul>
                                </section>

                                {/* Map */}
                                <section>
                                    <h3 className="text-xl font-serif font-medium text-brand-text mb-4 border-b border-gray-100 pb-2">Carte et informations d'accès</h3>
                                    <div className="h-64 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                                        <APIProvider apiKey="AIzaSyAHwXJxvDg9jK_nDrxz9hxd0_fQ1greZKo">
                                            <Map
                                                defaultCenter={{ lat: doctor.user?.profile?.lat || 4.0511, lng: doctor.user?.profile?.lng || 9.7679 }}
                                                defaultZoom={14}
                                                gestureHandling="greedy"
                                                disableDefaultUI={false}
                                                style={{ width: '100%', height: '100%' }}
                                            >
                                                <AdvancedMarker
                                                    position={{ lat: doctor.user?.profile?.lat || 4.0511, lng: doctor.user?.profile?.lng || 9.7679 }}
                                                    title={doctorName}
                                                />
                                            </Map>
                                        </APIProvider>
                                    </div>
                                </section>
                            </div>

                            {/* Right: Booking Widget (Desktop) */}
                            <div className="relative">
                                <div id="booking-section" className="hidden lg:block sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-brand-default" />
                                        Prendre rendez-vous
                                    </h3>

                                    {/* Visit Type Toggle */}
                                    {/* Visit Type - Restricted to Video
                                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-6 flex items-center justify-center gap-2 text-brand-default font-medium text-sm">
                                        <Video className="w-4 h-4" />
                                        Médécin disponible en téléconsultation uniquement
                                    </div> */}

                                    {/* Calendar */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="font-medium text-sm capitalize">
                                                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                                            </p>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={prevMonth}
                                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-brand-text" />
                                                </button>
                                                <button 
                                                    onClick={nextMonth}
                                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-brand-text" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Days Header */}
                                        <div className="grid grid-cols-7 mb-2">
                                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                                                <div key={i} className="text-center text-xs text-brand-muted font-medium py-1">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Days Grid */}
                                        <div className="grid grid-cols-7 gap-1">
                                            {calendarDays.map((day, i) => {
                                                const isSelected = isSameDay(day, selectedDate);
                                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                                const isPast = isBefore(day, today);
                                                // Check availability: specific date match first, then recurring
                                                const daySlots = doctor ? generateTimeSlots(doctor.availability, day, []) : [];
                                                const isAvailable = daySlots.length > 0;
                                                const isDisabled = isPast || !isAvailable;
                                                
                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={isDisabled}
                                                        onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                                                        className={cn(
                                                            "h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center relative",
                                                            isDisabled
                                                                ? "text-gray-200 cursor-not-allowed opacity-50" 
                                                                : !isCurrentMonth 
                                                                    ? "text-gray-300"
                                                                    : isSelected 
                                                                        ? "bg-brand-default text-white shadow-md z-10" 
                                                                        : "text-brand-text hover:bg-brand-light/50"
                                                        )}
                                                    >
                                                        {format(day, 'd')}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Slots Grid */}
                                    <div className="mb-6">
                                        <p className="font-medium mb-3 text-sm">
                                            Disponibilités pour le {format(selectedDate, 'd MMMM', { locale: fr })}
                                        </p>
                                        
                                        {slots.length === 0 ? (
                                            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100 text-brand-muted text-sm">
                                                Aucun créneau disponible pour cette date.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                {slots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={cn(
                                                            "py-2 px-1 rounded-lg text-sm font-medium border transition-all duration-300",
                                                            selectedSlot === slot
                                                                ? "bg-brand-default text-white border-brand-default shadow-md scale-105"
                                                                : "bg-white text-brand-text border-gray-200 hover:border-brand-default hover:text-brand-default"
                                                        )}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setIsBookingWizardOpen(true)}
                                        disabled={!selectedSlot}
                                        className={cn(
                                            "w-full py-3 rounded-xl font-bold transition-all",
                                            selectedSlot 
                                                ? "bg-brand-default text-white shadow-lg hover:shadow-xl hover:bg-brand-dark" 
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        )}
                                    >
                                        Confirmer le rendez-vous
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />

                {/* Booking Wizard */}
                <BookingWizard 
                    isOpen={isBookingWizardOpen} 
                    onClose={() => setIsBookingWizardOpen(false)} 
                    doctorId={id}
                    preselectedDoctor={doctor}
                    preselectedDate={selectedDate}
                    preselectedSlot={selectedSlot}
                    preselectedType={visitType}
                />
            </div>
        </PageTransition>
    );
}
