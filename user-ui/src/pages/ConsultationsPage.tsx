import { PageTransition } from '../components/PageTransition';
import { useConsultations } from '../hooks/useConsultations';
import { Calendar, Clock, Video, MessageSquare, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ConsultationsPage() {
    const { data: consultations, isLoading, error } = useConsultations();

    if (isLoading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-brand-default border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-brand-muted">Chargement des consultations...</p>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-brand-dark mb-2">
                            Erreur
                        </h2>
                        <p className="text-gray-600">
                            Impossible de charger les consultations. Veuillez réessayer.
                        </p>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-default transition-colors mb-3">
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour à l'accueil
                                </Link>
                                <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">
                                    Mes Consultations
                                </h1>
                                <p className="text-brand-muted">
                                    Gérez vos rendez-vous et consultations
                                </p>
                            </div>
                            <Link
                                to="/doctors"
                                className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-default transition-colors shadow-lg"
                            >
                                Nouvelle consultation
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {!consultations || consultations.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10 text-brand-dark" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-brand-dark mb-3">
                                Aucune consultation
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Vous n'avez pas encore de consultation programmée. Prenez rendez-vous avec un dermatologue.
                            </p>
                            <Link
                                to="/doctors"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-default transition-colors shadow-lg"
                            >
                                Trouver un dermatologue
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {consultations.map((consultation) => {
                                const rawDate = consultation.scheduledDate || consultation.scheduledAt || consultation.createdAt;
                                const consultationDate = rawDate ? new Date(rawDate) : null;
                                const isValidDate = consultationDate && !isNaN(consultationDate.getTime());
                                const isUpcoming = isValidDate && consultationDate > new Date();

                                return (
                                    <div
                                        key={consultation.id}
                                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                                    (consultation.consultationType || consultation.type) === 'video' 
                                                        ? 'bg-blue-100 text-blue-600' 
                                                        : (consultation.consultationType || consultation.type) === 'chat'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-brand-soft text-brand-dark'
                                                }`}>
                                                    {(consultation.consultationType || consultation.type) === 'video' ? (
                                                        <Video className="w-7 h-7" />
                                                    ) : (consultation.consultationType || consultation.type) === 'chat' ? (
                                                        <MessageSquare className="w-7 h-7" />
                                                    ) : (
                                                        <User className="w-7 h-7" />
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-brand-dark mb-1">
                                                        {(consultation.consultationType || consultation.type) === 'video' 
                                                            ? 'Consultation vidéo' 
                                                            : (consultation.consultationType || consultation.type) === 'chat'
                                                            ? 'Consultation par chat'
                                                            : 'Consultation en personne'}
                                                    </h3>
                                                    {consultation.description && (
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            {consultation.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted">
                                                        {isValidDate ? (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>
                                                                        {format(consultationDate, 'EEEE d MMMM yyyy', { locale: fr })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>
                                                                        {format(consultationDate, 'HH:mm', { locale: fr })}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="italic">Date non disponible</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                    consultation.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : consultation.status === 'in_progress'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : consultation.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {consultation.status === 'completed'
                                                        ? 'Terminée'
                                                        : consultation.status === 'in_progress'
                                                        ? 'En cours'
                                                        : consultation.status === 'cancelled'
                                                        ? 'Annulée'
                                                        : 'En attente'}
                                                </span>
                                                {isUpcoming && consultation.status === 'scheduled' && (
                                                    <Link
                                                        to={`/consultations/${consultation.id}`}
                                                        className="px-4 py-2 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-default transition-colors"
                                                    >
                                                        Voir
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
