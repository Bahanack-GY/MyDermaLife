import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { consultationsApi } from '../api/features/consultations';
import { PageTransition } from '../components/PageTransition';
import { Calendar, Clock, MapPin, Video, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function ConsultationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: consultation, isLoading, error } = useQuery({
        queryKey: ['consultation', id],
        queryFn: () => consultationsApi.getById(id!),
        enabled: !!id
    });

    const joinMutation = useMutation({
        mutationFn: consultationsApi.joinWaitingRoom,
        onSuccess: (_data, variables) => {
            // Navigate to the waiting room page
            navigate(`/waiting-room/${variables}`);
        },
        onError: () => {
             toast.error("Impossible de rejoindre la salle d'attente");
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-default" />
            </div>
        );
    }

    if (error || !consultation || !consultation.doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Consultation introuvable</h2>
                    <button 
                        onClick={() => navigate('/consultations')}
                        className="mt-4 text-brand-default hover:underline"
                    >
                        Retour aux consultations
                    </button>
                </div>
            </div>
        );
    }

    const doctor = consultation.doctor;
    const isToday = new Date(consultation.scheduledDate).getDate() === new Date().getDate();
    // Allow joining 15 mins before
    const canJoin = isToday && consultation.status !== 'cancelled' && consultation.status !== 'completed';

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <button 
                        onClick={() => navigate('/consultations')}
                        className="flex items-center gap-2 text-gray-600 hover:text-brand-dark mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </button>

                    <div className="bg-white rounded-3xl overflow-hidden border border-brand-light">
                        {/* Header */}
                        <div className="bg-brand-default/5 p-6 md:p-8 flex items-start justify-between gap-4">
                            <div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block",
                                    consultation.status === 'scheduled' ? "bg-brand-soft text-brand-dark" :
                                    consultation.status === 'completed' ? "bg-green-100 text-green-700" :
                                    consultation.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700"
                                )}>
                                    {consultation.status === 'scheduled' ? 'Programmé' : consultation.status}
                                </span>
                                <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark mb-2">
                                    Consultation avec Dr. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                                </h1>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <span className="capitalize">{consultation.consultationType === 'video' ? 'Vidéo Consultation' : 'En Cabinet'}</span>
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-white p-1 shrink-0">
                                <img 
                                    src={doctor.user.profile.profilePhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"} 
                                    alt="Doctor" 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-default shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Date</p>
                                        <p className="text-gray-900 font-semibold text-lg capitalize">
                                            {format(new Date(consultation.scheduledDate), 'EEEE d MMMM yyyy', { locale: fr })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-default shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Heure</p>
                                        <p className="text-gray-900 font-semibold text-lg">
                                            {format(new Date(consultation.scheduledDate), 'HH:mm')} - {format(new Date(new Date(consultation.scheduledDate).getTime() + 30*60000), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-light/20 flex items-center justify-center text-brand-default shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Lieu</p>
                                        <p className="text-gray-900 font-semibold">
                                            {consultation.consultationType === 'video' ? 'En ligne (Lien ci-dessous)' : `${doctor.user.profile.city || 'Cabinet'}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center">
                                {consultation.consultationType === 'video' ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-brand-soft text-brand-default rounded-full flex items-center justify-center mx-auto">
                                            <Video className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Salle d'attente virtuelle</h3>
                                            <p className="text-gray-500 text-sm">
                                                Rejoignez la salle d'attente pour signaler votre présence au médecin.
                                            </p>
                                        </div>
                                        
                                        {consultation.isPatientOnline ? (
                                            <div className="space-y-3">
                                                <div className="py-3 px-4 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    Vous êtes dans la salle d'attente
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/waiting-room/${consultation.id}`)}
                                                    className="w-full py-2.5 rounded-xl font-medium text-brand-default border-2 border-brand-default hover:bg-brand-default hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Accéder à la salle d'attente
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => joinMutation.mutate(consultation.id)}
                                                disabled={!canJoin || joinMutation.isPending}
                                                className={cn(
                                                    "w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                                                    !canJoin 
                                                        ? "bg-gray-300 cursor-not-allowed" 
                                                        : "bg-brand-default hover:bg-brand-dark"
                                                )}
                                            >
                                                {joinMutation.isPending ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : "Rejoindre la salle d'attente"}
                                            </button>
                                        )}
                                        {/* {!isToday && (
                                            <p className="text-xs text-amber-600 font-medium">
                                                Disponible le jour du rendez-vous
                                            </p>
                                        )} */}
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                         <div className="w-16 h-16 bg-brand-light/30 text-brand-default rounded-full flex items-center justify-center mx-auto">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Rendez-vous au cabinet</h3>
                                            <p className="text-gray-500 text-sm">
                                                Veuillez vous présenter à l'adresse indiquée 10 minutes avant l'heure.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
