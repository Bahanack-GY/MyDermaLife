import { useRef, useEffect, useState, useCallback } from 'react';
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
  onEndCall: () => void;
  patientName?: string;
  consultationId?: string;
}

const qualityConfig: Record<ConnectionQuality, { color: string; label: string }> = {
  excellent: { color: 'bg-green-500', label: 'telemedicine.quality.excellent' },
  good: { color: 'bg-green-400', label: 'telemedicine.quality.good' },
  fair: { color: 'bg-yellow-500', label: 'telemedicine.quality.fair' },
  poor: { color: 'bg-orange-500', label: 'telemedicine.quality.poor' },
  'audio-only': { color: 'bg-red-500', label: 'telemedicine.quality.audioOnly' },
};

import { EndCallModal } from './EndCallModal';

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
  patientName,
  consultationId,
}: VideoCallProps) {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // Callback refs to handle element mounting/unmounting robustly
  const setLocalVideoRef = useCallback((node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && localStream) {
      node.srcObject = localStream;
      // autoPlay attribute will handle playback
    }
  }, [localStream]);

  const setRemoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStream) {
      node.srcObject = remoteStream;
      // autoPlay attribute will handle playback
    }
  }, [remoteStream]);

  // We still need to update srcObject if stream changes while element is mounted
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Call Timer Logic
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isConnected) {
        // Recover start time
        let start = Date.now();
        if (consultationId) {
            const storedStart = sessionStorage.getItem(`call_start_${consultationId}`);
            if (storedStart) {
                start = parseInt(storedStart, 10);
            } else {
                sessionStorage.setItem(`call_start_${consultationId}`, start.toString());
            }
        }

        // Initial set
        setDuration(Math.floor((Date.now() - start) / 1000));

        interval = setInterval(() => {
            setDuration(Math.floor((Date.now() - start) / 1000));
        }, 1000);
    } else {
        setDuration(0);
    }

    return () => clearInterval(interval);
  }, [isConnected, consultationId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const qualityInfo = qualityConfig[connectionQuality];

  return (
    <div className="flex-1 relative bg-gray-900 rounded-2xl overflow-hidden flex flex-col">
      {/* Remote Video (Main view) */}
      <div className="flex-1 relative flex items-center justify-center">
        {remoteStream && peerVideoEnabled ? (
          <video
            ref={setRemoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            onLoadedMetadata={(e) => {
              // Fallback for autoplay restrictions
              e.currentTarget.play().catch(err => {
                console.warn('Remote video autoplay blocked:', err.name);
              });
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/60">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <User className="w-12 h-12" />
            </div>
            <p className="text-lg font-medium">{patientName || t('telemedicine.patient')}</p>
            {isConnecting && (
              <p className="text-sm mt-2 animate-pulse">{t('telemedicine.connecting')}</p>
            )}
            {isConnected && !peerVideoEnabled && (
              <p className="text-sm mt-2 flex items-center gap-2">
                <VideoOff className="w-4 h-4" />
                {t('telemedicine.videoDisabled')}
              </p>
            )}
          </div>
        )}

        {/* Connection Quality Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={cn(
            "px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-medium backdrop-blur-sm",
            isConnected ? "bg-black/40" : "bg-black/60"
          )}>
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className={cn("w-2 h-2 rounded-full", qualityInfo.color)} />
                <span>{t(qualityInfo.label)}</span>
                <span className="w-px h-3 bg-white/20 mx-1"></span>
                <span className="font-mono text-xs">{formatTime(duration)}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>{t('telemedicine.disconnected')}</span>
              </>
            )}
          </div>
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl">
          {localStream && isVideoEnabled ? (
            <video
              ref={setLocalVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              onLoadedMetadata={(e) => {
                e.currentTarget.muted = true; // Ensure muted for autoplay
                // autoPlay attribute will handle playback
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <VideoOff className="w-8 h-8" />
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
          title={isMuted ? t('telemedicine.unmute') : t('telemedicine.mute')}
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
          title={isVideoEnabled ? t('telemedicine.disableVideo') : t('telemedicine.enableVideo')}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsEndModalOpen(true)}
          className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors shadow-lg shadow-red-600/30 px-6"
          title={t('telemedicine.endCall')}
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      <EndCallModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={() => {
          if (consultationId) {
            sessionStorage.removeItem(`call_start_${consultationId}`);
          }
          setIsEndModalOpen(false);
          onEndCall();
        }}
        patientName={patientName}
      />
    </div>
  );
}
