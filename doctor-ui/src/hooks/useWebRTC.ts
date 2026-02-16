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
    onPatientStatusChange?: (status: 'waiting' | 'left' | 'finished') => void;
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
    recordingBlob: Blob | null;
    toggleMute: () => void;
    toggleVideo: () => void;
    endCall: () => Promise<Blob | null>;
    startCall: () => Promise<void>;
}

export function useWebRTC({
    serverUrl,
    roomId,
    role,
    onRemoteStream,
    onConnectionStateChange,
    onQualityChange,
    onPatientStatusChange,
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
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const makingOfferRef = useRef(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Start recording mixed audio from local + remote streams
    const startRecording = useCallback((localStr: MediaStream, remoteStr: MediaStream) => {
        try {
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const localSource = audioContext.createMediaStreamSource(localStr);
            const remoteSource = audioContext.createMediaStreamSource(remoteStr);
            const destination = audioContext.createMediaStreamDestination();

            localSource.connect(destination);
            remoteSource.connect(destination);

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(destination.stream, { mimeType });
            recordingChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordingChunksRef.current.push(e.data);
                }
            };

            recorder.start(1000); // collect chunks every 1s
            mediaRecorderRef.current = recorder;
            console.log('[useWebRTC] Audio recording started');
        } catch (err) {
            console.error('[useWebRTC] Failed to start recording:', err);
        }
    }, []);

    // Stop recording and produce a blob
    const stopRecording = useCallback(() => {
        return new Promise<Blob | null>((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder || recorder.state === 'inactive') {
                resolve(null);
                return;
            }

            recorder.onstop = () => {
                const blob = new Blob(recordingChunksRef.current, { type: recorder.mimeType });
                recordingChunksRef.current = [];
                mediaRecorderRef.current = null;
                console.log(`[useWebRTC] Recording stopped. Blob size: ${blob.size} bytes`);
                resolve(blob);
            };

            recorder.stop();

            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
                audioContextRef.current = null;
            }
        });
    }, []);

    // Cleanup function - returns the recording blob if available
    const cleanup = useCallback(async (): Promise<Blob | null> => {
        // Stop recording and save the blob before cleanup
        const blob = await stopRecording();
        if (blob && blob.size > 0) {
            setRecordingBlob(blob);
        }

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

        return blob;
    }, [roomId, stopRecording]);

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

                // Start audio recording when both streams are available
                if (role === 'doctor' && localStreamRef.current) {
                    const remoteStr = pc.getReceivers()
                        .filter(r => r.track.kind === 'audio')
                        .reduce((stream, receiver) => {
                            stream.addTrack(receiver.track);
                            return stream;
                        }, new MediaStream());
                    if (remoteStr.getAudioTracks().length > 0) {
                        startRecording(localStreamRef.current, remoteStr);
                    }
                }
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
    }, [roomId, role, onRemoteStream, onConnectionStateChange, startQualityMonitoring, startRecording]);

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

            // Patient Status Events
            socket.on('patient-joined-waiting-room', () => {
                onPatientStatusChange?.('waiting');
            });
            socket.on('patient-left-waiting-room', () => {
                onPatientStatusChange?.('left');
            });
            socket.on('patient-finished-consultation', () => {
                onPatientStatusChange?.('finished');
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
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                socketRef.current?.emit('toggle-audio', { roomId, enabled: audioTrack.enabled });
            }
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

    // End call - returns the recording blob
    const endCall = useCallback(async (): Promise<Blob | null> => {
        return cleanup();
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
        recordingBlob,
        toggleMute,
        toggleVideo,
        endCall,
        startCall,
    };
}
