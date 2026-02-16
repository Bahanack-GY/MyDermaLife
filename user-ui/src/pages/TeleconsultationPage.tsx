import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { VideoCall } from '../components/VideoCall';
import { useWebRTC } from '../hooks/useWebRTC';
import { PageTransition } from '../components/PageTransition';
import { consultationsApi } from '../api/features/consultations';
import { Loader2 } from 'lucide-react';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://api.myderma.evols.online';
const SIGNALING_SERVER = RAW_API_URL.replace(/\/api\/v1\/?$/, '');

export function TeleconsultationPage() {
  const { t } = useTranslation();
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const [callStarted, setCallStarted] = useState(false);

  // Fetch consultation details to show doctor info
  const { data: consultation, isLoading } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => consultationsApi.getById(consultationId!),
    enabled: !!consultationId
  });

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    connectionQuality,
    isMuted,
    isVideoEnabled,
    peerVideoEnabled,
    toggleMute,
    toggleVideo,
    endCall,
    startCall,
  } = useWebRTC({
    serverUrl: SIGNALING_SERVER,
    roomId: consultationId || '',
    role: 'patient', // Patient role
    onConsultationEnded: () => {
      endCall();
      navigate(`/consultations/${consultationId}/rate`);
    },
  });

  useEffect(() => {
    if (consultationId && !callStarted) {
      setCallStarted(true);
      startCall().catch(err => {
        console.error('Failed to start call:', err);
      });
    }
  }, [consultationId, callStarted, startCall]);

  const handleEndCall = async (choice: 'leave' | 'end') => {
    endCall();
    if (choice === 'end') {
        try {
            await consultationsApi.finish(consultationId!);
        } catch (e) {
            console.error("Failed to finish consultation", e);
        }
        navigate(`/consultations/${consultationId}/rate`);
    } else {
        navigate(`/waiting-room/${consultationId}`);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-default" />
        </div>
      </PageTransition>
    );
  }

  if (!consultationId) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <h2 className="text-xl font-serif font-bold mb-2">
              {t('consultation.noActiveSession', 'Aucune session active')}
            </h2>
            <p className="text-white/60 mb-4">
              {t('consultation.waitForDoctor', 'Veuillez attendre que votre médecin démarre la consultation.')}
            </p>
            <button 
              onClick={() => navigate('/consultations')}
              className="text-brand-default hover:underline"
            >
              {t('common.back', 'Retour')}
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const doctorName = consultation?.doctor?.user?.profile 
    ? `Dr. ${consultation.doctor.user.profile.lastName}`
    : t('consultation.doctor', 'Médecin');

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gray-900/80 text-white flex items-center justify-between border-b border-white/10">
          <div>
            <h1 className="text-lg font-semibold">{t('consultation.title', 'Consultation Vidéo')}</h1>
            <p className="text-sm text-white/60">
              {isConnected 
                ? t('consultation.connected', 'Connecté à votre médecin') 
                : t('consultation.connecting', 'Connexion en cours...')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{doctorName}</p>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 p-4 flex flex-col">
          <VideoCall
            localStream={localStream}
            remoteStream={remoteStream}
            isConnected={isConnected}
            isConnecting={isConnecting}
            connectionQuality={connectionQuality}
            isMuted={isMuted}
            isVideoEnabled={isVideoEnabled}
            peerVideoEnabled={peerVideoEnabled}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onEndCall={handleEndCall}
            doctorName={doctorName}
          />
        </div>
      </div>
    </PageTransition>
  );
}
