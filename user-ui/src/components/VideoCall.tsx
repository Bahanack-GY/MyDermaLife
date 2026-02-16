import { useRef, useEffect, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Wifi, WifiOff, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { type ConnectionQuality } from '../hooks/useWebRTC';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionQuality: ConnectionQuality;
  isMuted: boolean;
  isVideoEnabled: boolean;
  peerVideoEnabled: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: (choice: 'leave' | 'end') => void;
  doctorName?: string;
}

const qualityConfig: Record<ConnectionQuality, { color: string; label: string }> = {
  excellent: { color: 'bg-green-500', label: 'consultation.quality.excellent' },
  good: { color: 'bg-green-400', label: 'consultation.quality.good' },
  fair: { color: 'bg-yellow-500', label: 'consultation.quality.fair' },
  poor: { color: 'bg-orange-500', label: 'consultation.quality.poor' },
  'audio-only': { color: 'bg-red-500', label: 'consultation.quality.audioOnly' },
};

import { EndConsultationModal } from './EndConsultationModal';

export function VideoCall({
  localStream,
  remoteStream,
  isConnected,
  isConnecting,
  connectionQuality,
  isMuted,
  isVideoEnabled,
  peerVideoEnabled,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  doctorName,
}: VideoCallProps) {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // Callback refs to handle element mounting/unmounting robustly
  const setLocalVideoRef = (node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && localStream) {
      node.srcObject = localStream;
      node.play().catch(e => console.warn("Local play error", e));
    }
  };

  const setRemoteVideoRef = (node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStream) {
      node.srcObject = remoteStream;
      node.play().catch(e => console.warn("Remote play error", e));
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element with robust playback handling
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      // Ensure we try to play, handling autoplay policies
      remoteVideoRef.current.play().catch(e => {
        console.warn('Autoplay blocked:', e);
        // We could show a "Click to play" button here if needed
      });
    }
  }, [remoteStream]); // Re-run if video is toggled

  const qualityInfo = qualityConfig[connectionQuality];

  return (
    <div className="flex-1 relative bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
      {/* Remote Video (Main view) */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {remoteStream && peerVideoEnabled ? (
          <video
            key={remoteStream.id}
            ref={setRemoteVideoRef}
            autoPlay
            playsInline
            controls // Debug: Allow manual play
            className="absolute inset-0 w-full h-full object-cover z-0"
            onLoadedMetadata={(e) => {
              e.currentTarget.play().catch(console.error);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/60 p-4 text-center z-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4 border border-white/10">
              <User className="w-10 h-10 md:w-12 md:h-12 text-white/50" />
            </div>
            <p className="text-base md:text-lg font-medium">{doctorName || t('consultation.doctor')}</p>
            {isConnecting && (
              <p className="text-xs md:text-sm mt-2 animate-pulse text-brand-default">{t('consultation.connecting')}</p>
            )}
            {isConnected && !peerVideoEnabled && (
              <p className="text-xs md:text-sm mt-2 flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">
                <VideoOff className="w-3.5 h-3.5" />
                {t('consultation.videoDisabled', 'Video désactivée')}
              </p>
            )}
          </div>
        )}

        {/* Connection Quality Indicator */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          <div className={cn(
            "px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 text-white text-[10px] md:text-xs font-medium backdrop-blur-md border border-white/10 shadow-sm",
            isConnected ? "bg-black/40" : "bg-black/60"
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", qualityInfo.color)} />
                <span className="hidden sm:inline">{t(qualityInfo.label)}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>{t('consultation.disconnected', 'Déconnecté')}</span>
              </>
            )}
          </div>
        </div>

        {/* Local Video (PiP) - Explicit sizing for stability */}
        <div className="absolute bottom-20 md:bottom-4 right-4 z-50 w-28 h-40 md:w-48 md:h-64 bg-gray-800 rounded-lg md:rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-300">
          {localStream && isVideoEnabled ? (
            <video
              key={localStream.id}
              ref={setLocalVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100" // Use Tailwind scale transform instead of custom "mirror"
              onLoadedMetadata={(e) => {
                e.currentTarget.play().catch(console.error);
                e.currentTarget.muted = true; // Force mute
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 bg-gray-900">
              <VideoOff className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-gray-900/90 backdrop-blur flex items-center justify-center gap-4">
        <button
          onClick={onToggleMute}
          className={cn(
            "p-3 rounded-full transition-colors",
            isMuted
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-700/50 hover:bg-gray-700 text-white"
          )}
          title={isMuted ? t('consultation.unmute') : t('consultation.mute')}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleVideo}
          className={cn(
            "p-3 rounded-full transition-colors",
            !isVideoEnabled
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-700/50 hover:bg-gray-700 text-white"
          )}
          title={isVideoEnabled ? t('consultation.disableVideo') : t('consultation.enableVideo')}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsEndModalOpen(true)}
          className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors px-6"
          title={t('consultation.endCall')}
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      <EndConsultationModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={(choice) => {
          setIsEndModalOpen(false);
          onEndCall(choice);
        }}
      />
    </div>
  );
}
