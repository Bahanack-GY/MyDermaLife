import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface JoinRoomPayload {
    roomId: string;
    role: 'doctor' | 'patient';
}

interface SignalPayload {
    roomId: string;
    signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

@WebSocketGateway({
    cors: {
        origin: true, // Allow requests from any origin with credentials
        credentials: true,
    },
    namespace: '/signaling',
    transports: ['websocket', 'polling'],
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(SignalingGateway.name);

    // Track which socket is in which room and their role
    private roomParticipants = new Map<string, Map<string, { socketId: string; role: string }>>();

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Find and notify room participants about disconnection
        this.roomParticipants.forEach((participants, roomId) => {
            participants.forEach((info, odParticipantId) => {
                if (info.socketId === client.id) {
                    participants.delete(odParticipantId);
                    // Notify others in the room
                    client.to(roomId).emit('peer-disconnected', { role: info.role });
                }
            });

            // Clean up empty rooms
            if (participants.size === 0) {
                this.roomParticipants.delete(roomId);
            }
        });
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinRoomPayload,
    ) {
        const { roomId, role } = payload;

        this.logger.log(`${role} joining room: ${roomId}`);

        // Track participant - Initialize room if not exists
        if (!this.roomParticipants.has(roomId)) {
            this.roomParticipants.set(roomId, new Map());
        }

        const participants = this.roomParticipants.get(roomId)!;

        // Enforce unique role per room: Remove any existing participant with the same role
        for (const [existingSocketId, participant] of participants.entries()) {
            if (participant.role === role && existingSocketId !== client.id) {
                this.logger.warn(`Duplicate ${role} detected in room ${roomId}. Removing old socket ${existingSocketId}.`);

                // Notify the old client they are being replaced
                this.server.to(existingSocketId).emit('session-replaced');

                // Force leave the room
                this.server.in(existingSocketId).socketsLeave(roomId);

                // Remove from local map
                participants.delete(existingSocketId);
            }
        }

        // Join the socket.io room
        client.join(roomId);

        // Add new participant
        participants.set(client.id, { socketId: client.id, role });

        // Notify others in the room
        client.to(roomId).emit('peer-joined', { role });

        // Check if both doctor AND patient are present
        const roles = Array.from(participants.values()).map(p => p.role);
        const hasDoctor = roles.includes('doctor');
        const hasPatient = roles.includes('patient');

        if (hasDoctor && hasPatient) {
            // Both parties are ready - notify to start negotiation
            this.server.to(roomId).emit('ready-to-connect');
        }

        return { success: true, roomId };
    }

    @SubscribeMessage('leave-room')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { roomId: string },
    ) {
        const { roomId } = payload;

        client.leave(roomId);

        const participants = this.roomParticipants.get(roomId);
        if (participants) {
            const info = participants.get(client.id);
            if (info) {
                client.to(roomId).emit('peer-disconnected', { role: info.role });
                participants.delete(client.id);
            }
        }

        return { success: true };
    }

    @SubscribeMessage('offer')
    handleOffer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SignalPayload,
    ) {
        const { roomId, signal } = payload;
        this.logger.debug(`Offer received for room: ${roomId}`);

        // Forward offer to the other participant
        client.to(roomId).emit('offer', { signal });

        return { success: true };
    }

    @SubscribeMessage('answer')
    handleAnswer(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SignalPayload,
    ) {
        const { roomId, signal } = payload;
        this.logger.debug(`Answer received for room: ${roomId}`);

        // Forward answer to the other participant
        client.to(roomId).emit('answer', { signal });

        return { success: true };
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SignalPayload,
    ) {
        const { roomId, signal } = payload;

        // Forward ICE candidate to the other participant
        client.to(roomId).emit('ice-candidate', { signal });

        return { success: true };
    }

    @SubscribeMessage('toggle-video')
    handleToggleVideo(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { roomId: string; enabled: boolean },
    ) {
        client.to(payload.roomId).emit('peer-video-toggle', { enabled: payload.enabled });
        return { success: true };
    }

    @SubscribeMessage('toggle-audio')
    handleToggleAudio(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { roomId: string; enabled: boolean },
    ) {
        client.to(payload.roomId).emit('peer-audio-toggle', { enabled: payload.enabled });
        return { success: true };
    }
}
