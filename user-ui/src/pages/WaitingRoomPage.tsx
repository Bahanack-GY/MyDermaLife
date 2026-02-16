import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { consultationsApi } from '../api/features/consultations';
import { PageTransition } from '../components/PageTransition';
import { WaitingRoomModel } from '../components/ThreeD/WaitingRoomModel';
import { Loader2, Video, LogOut, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://api.myderma.evols.online';
const SIGNALING_SERVER = RAW_API_URL.replace(/\/api\/v1\/?$/, '');



export function WaitingRoomPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [callActive, setCallActive] = useState(false);

    const { data: consultation, isLoading, error } = useQuery({
        queryKey: ['consultation', id],
        queryFn: () => consultationsApi.getById(id!),
        enabled: !!id
    });

    const joinMutation = useMutation({
        mutationFn: consultationsApi.joinWaitingRoom
    });

    // Auto-join on mount/load
    useEffect(() => {
        if (id && consultation && !consultation.isPatientOnline) {
            joinMutation.mutate(id);
        }
    }, [id, consultation]);

    const leaveMutation = useMutation({
        mutationFn: consultationsApi.leaveWaitingRoom,
        onSuccess: () => {
             navigate('/consultations');
        },
        onError: () => {
             // Even if error, we should probably let them leave locally
             navigate('/consultations');
        }
    });

    const handleLeave = () => {
        if (id) {
            leaveMutation.mutate(id);
        } else {
             navigate('/consultations');
        }
    };



    // Listen for call-started event from doctor
    useEffect(() => {
        if (!id) return;

        const socket: Socket = io(`${SIGNALING_SERVER}/signaling`, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        socket.on('connect', () => {
            // Join as 'waiting' - just to listen, not to participate in the call yet
            // The actual 'patient' role join happens in TeleconsultationPage
            socket.emit('join-room', { roomId: id, role: 'waiting' });
        });

        socket.on('call-started', () => {
            setCallActive(true);
        });

        socket.on('peer-joined', ({ role }: { role: string }) => {
            // Doctor joined, call is ready
            if (role === 'doctor') {
                setCallActive(true);
            }
        });

        return () => {
            socket.emit('leave-room', { roomId: id });
            socket.disconnect();
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-default" />
            </div>
        );
    }

    if (error || !consultation || !consultation.doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
                 <div className="z-10 bg-white p-4 rounded shadow-lg">
                     <p className="mb-2">Consultation introuvable (Debug Mode)</p>
                     <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-500 text-white rounded">Retour</button>
                 </div>
                 <div className="absolute top-0 left-0 w-full h-full z-0">
                    <WaitingRoomModel />
                 </div>
            </div>
        );
    }

    const doctor = consultation.doctor;


    return (
        <PageTransition>
            <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col">
                
                {/* Top Left: Doctor Info */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                     <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/50 flex items-center gap-4 animate-[slideInLeft_0.5s_ease-out]">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-default p-0.5">
                                <img 
                                    src={doctor.user.profile.profilePhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"} 
                                    alt="Doctor" 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">Votre Médecin</p>
                            <h2 className="text-lg font-serif font-bold text-brand-dark leading-tight">
                                Dr. {doctor.user.profile.lastName}
                            </h2>
                            <p className="text-xs text-gray-500">{doctor.specialization || "Dermatologue"}</p>
                        </div>
                     </div>
                </div>

                {/* Back Button (Top Right) */}
                 <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
                    <button 
                        onClick={handleLeave}
                        className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white backdrop-blur rounded-full text-brand-dark transition-all hover:scale-105 font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Quitter la salle d'attente
                    </button>
                 </div>

                {/* Center Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
                    
                    <div className="mb-12 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-soft text-brand-dark rounded-full font-bold animate-pulse">
                            <Video className="w-4 h-4" />
                            Salle d'attente virtuelle
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark">
                            Le médecin arrive bientôt
                        </h1>
                        <p className="text-gray-500 text-lg max-w-lg mx-auto">
                            Installez-vous confortablement. Nous vous avons notifié comme présent.
                        </p>
                        
                    {/* Join Call Button - appears when doctor starts call */}
                    {callActive && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate(`/teleconsultation/${id}`)}
                            className="mt-6 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-lg shadow-green-500/30"
                        >
                            <Phone className="w-5 h-5" />
                            Rejoindre la consultation vidéo
                        </motion.button>
                    )}
                    </div>
                </div>

                {/* 3D Waiting Room Background */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <WaitingRoomModel />
                </div>



            </div>
        </PageTransition>
    );
}
