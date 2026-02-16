import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// STUN servers for ICE candidate gathering (use TURN in production)
const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'audio-only';

interface UseWebRTCOptions {
    serverUrl: string;
    roomId: string;
    role: 'doctor' | 'patient';
    onRemoteStream?: (stream: MediaStream) => void;
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
    onQualityChange?: (quality: ConnectionQuality) => void;
    onConsultationEnded?: () => void;
}

interface UseWebRTCReturn {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectionQuality: ConnectionQuality;
    isMuted: boolean;
    isVideoEnabled: boolean;
    peerVideoEnabled: boolean;
    peerAudioEnabled: boolean;
    toggleMute: () => void;
    toggleVideo: () => void;
    endCall: () => void;
    startCall: () => Promise<void>;
}

export function useWebRTC({
    serverUrl,
    roomId,
    role,
    onRemoteStream,
    onConnectionStateChange,
    onQualityChange,
    onConsultationEnded,
}: UseWebRTCOptions): UseWebRTCReturn {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [peerVideoEnabled, setPeerVideoEnabled] = useState(true);
    const [peerAudioEnabled, setPeerAudioEnabled] = useState(true);

    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const makingOfferRef = useRef(false);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (statsIntervalRef.current) {
            clearInterval(statsIntervalRef.current);
            statsIntervalRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.emit('leave-room', { roomId });
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setLocalStream(null);
        setRemoteStream(null);
        setIsConnected(false);
        setIsConnecting(false);
    }, [roomId]);

    // Monitor connection quality
    const startQualityMonitoring = useCallback(() => {
        if (statsIntervalRef.current) return;

        statsIntervalRef.current = setInterval(async () => {
            if (!peerConnectionRef.current) return;

            try {
                const stats = await peerConnectionRef.current.getStats();
                let outgoingBitrate = 0;

                stats.forEach(report => {
                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        outgoingBitrate = report.availableOutgoingBitrate || 0;
                    }
                });

                let quality: ConnectionQuality = 'excellent';
                if (outgoingBitrate > 0) {
                    if (outgoingBitrate > 1000000) quality = 'excellent';
                    else if (outgoingBitrate > 500000) quality = 'good';
                    else if (outgoingBitrate > 200000) quality = 'fair';
                    else if (outgoingBitrate > 100000) quality = 'poor';
                    else quality = 'audio-only';
                }

                if (quality !== connectionQuality) {
                    setConnectionQuality(quality);
                    onQualityChange?.(quality);

                    // Adaptive quality: disable video if bandwidth is too low
                    if (quality === 'audio-only' && isVideoEnabled && localStreamRef.current) {
                        const videoTrack = localStreamRef.current.getVideoTracks()[0];
                        if (videoTrack) {
                            videoTrack.enabled = false;
                            setIsVideoEnabled(false);
                            socketRef.current?.emit('toggle-video', { roomId, enabled: false });
                        }
                    }
                }
            } catch (error) {
                console.error('Error getting stats:', error);
            }
        }, 5000);
    }, [connectionQuality, isVideoEnabled, onQualityChange, roomId]);

    // Create peer connection
    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    roomId,
                    signal: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);
            onRemoteStream?.(stream);
        };

        pc.onconnectionstatechange = async () => {
            onConnectionStateChange?.(pc.connectionState);

            if (pc.connectionState === 'connected') {
                setIsConnected(true);
                setIsConnecting(false);
                startQualityMonitoring();
            } else if (pc.connectionState === 'failed') {
                console.warn('[useWebRTC] Connection failed (ICE). Attempting restart...');
                if (role === 'doctor') {
                    try {
                        const offer = await pc.createOffer({ iceRestart: true });
                        await pc.setLocalDescription(offer);
                        socketRef.current?.emit('offer', { roomId, signal: offer });
                    } catch (e) {
                        console.error('ICE Restart failed:', e);
                    }
                }
            } else if (pc.connectionState === 'disconnected') {
                setIsConnected(false);
            }
        };

        return pc;
    }, [roomId, role, onRemoteStream, onConnectionStateChange, startQualityMonitoring]);

    // Start the call
    const startCall = useCallback(async () => {
        try {
            setIsConnecting(true);

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            // Connect to signaling server
            const socket = io(`${serverUrl}/signaling`, {
                transports: ['websocket', 'polling'],
                withCredentials: true,
            });
            socketRef.current = socket;

            // Create peer connection
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            // Add local tracks to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Socket event handlers
            socket.on('connect', () => {
                socket.emit('join-room', { roomId, role });
            });

            socket.on('reconnect', () => {
                console.log('Socket reconnected. Re-joining room...');
                socket.emit('join-room', { roomId, role });
            });

            socket.on('peer-joined', async () => {
                // Only doctor creates offers, and only via ready-to-connect to avoid duplicates
                console.log('Peer joined the room');
            });

            socket.on('ready-to-connect', async () => {
                const pc = peerConnectionRef.current;
                if (!pc) return;

                // Both parties are in the room - doctor creates offer
                if (role === 'doctor' && pc.signalingState === 'stable' && !makingOfferRef.current) {
                    makingOfferRef.current = true;
                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('offer', { roomId, signal: offer });
                    } catch (error) {
                        console.error('Error creating offer:', error);
                    } finally {
                        makingOfferRef.current = false;
                    }
                }
            });

            // Patient handles offers (doctor sends offers)
            socket.on('offer', async ({ signal }: { signal: RTCSessionDescriptionInit }) => {
                const pc = peerConnectionRef.current;
                if (!pc) return;

                // Only patient should process offers
                if (role === 'doctor') {
                    console.log('Doctor ignoring offer (doctors send offers, not receive them)');
                    return;
                }
                if (pc.signalingState !== 'stable') {
                    console.warn('Received offer in non-stable state, ignoring');
                    return;
                }
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                    // Process any pending ICE candidates
                    for (const candidate of pendingCandidatesRef.current) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            console.error('Error adding queued ICE candidate:', e);
                        }
                    }
                    pendingCandidatesRef.current = [];
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('answer', { roomId, signal: answer });
                } catch (error) {
                    console.error('Error processing offer:', error);
                }
            });

            // Doctor handles answers (patient sends answers)
            socket.on('answer', async ({ signal }: { signal: RTCSessionDescriptionInit }) => {
                const pc = peerConnectionRef.current;
                if (!pc) return;

                // Only doctor should process answers
                if (role === 'patient') {
                    console.log('Patient ignoring answer (patients send answers, not receive them)');
                    return;
                }
                if (pc.signalingState !== 'have-local-offer') {
                    console.warn('Received answer in wrong state:', pc.signalingState);
                    return;
                }
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                    // Process any pending ICE candidates
                    for (const candidate of pendingCandidatesRef.current) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            console.error('Error adding queued ICE candidate:', e);
                        }
                    }
                    pendingCandidatesRef.current = [];
                } catch (error) {
                    console.error('Error processing answer:', error);
                }
            });

            socket.on('ice-candidate', async ({ signal }: { signal: RTCIceCandidateInit }) => {
                const pc = peerConnectionRef.current;
                if (!pc) return;

                // Queue candidates if remote description not set yet
                if (!pc.remoteDescription) {
                    pendingCandidatesRef.current.push(signal);
                    return;
                }
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal));
                } catch (error) {
                    console.error('Error adding ICE candidate:', error);
                }
            });

            socket.on('peer-disconnected', () => {
                console.log('Peer disconnected. Resetting connection...');
                setRemoteStream(null);
                setIsConnected(false);

                // Reset PeerConnection to be ready for re-connection
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                }

                // Create fresh PC
                const newPc = createPeerConnection();
                peerConnectionRef.current = newPc;

                // Re-add local tracks
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => {
                        if (localStreamRef.current) {
                            newPc.addTrack(track, localStreamRef.current);
                        }
                    });
                }
            });

            socket.on('peer-video-toggle', ({ enabled }: { enabled: boolean }) => {
                setPeerVideoEnabled(enabled);
            });

            socket.on('peer-audio-toggle', ({ enabled }: { enabled: boolean }) => {
                setPeerAudioEnabled(enabled);
            });

            socket.on('consultation-ended', () => {
                console.log('Consultation ended by doctor');
                onConsultationEnded?.();
            });

        } catch (error) {
            console.error('Error starting call:', error);
            setIsConnecting(false);
            cleanup();
            throw error;
        }
    }, [serverUrl, roomId, role, createPeerConnection, cleanup]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                const newValue = !audioTrack.enabled;
                audioTrack.enabled = newValue;
                setIsMuted(!newValue);
                console.log(`[useWebRTC] Micro toggled: ${newValue ? 'UNMUTED' : 'MUTED'}`);
                socketRef.current?.emit('toggle-audio', { roomId, enabled: newValue });
            } else {
                console.warn('[useWebRTC] No audio track found to toggle');
            }
        } else {
            console.warn('[useWebRTC] No local stream found to toggle audio');
        }
    }, [roomId]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                socketRef.current?.emit('toggle-video', { roomId, enabled: videoTrack.enabled });
            }
        }
    }, [roomId]);

    // End call
    const endCall = useCallback(() => {
        cleanup();
    }, [cleanup]);

    // Page unload protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isConnected || isConnecting) {
                e.preventDefault();
                e.returnValue = 'Call in progress';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isConnected, isConnecting]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        localStream,
        remoteStream,
        isConnected,
        isConnecting,
        connectionQuality,
        isMuted,
        isVideoEnabled,
        peerVideoEnabled,
        peerAudioEnabled,
        toggleMute,
        toggleVideo,
        endCall,
        startCall,
    };
}
