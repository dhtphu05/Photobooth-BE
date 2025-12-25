import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from './booth.events';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class BoothGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server<ClientToServerEvents, ServerToClientEvents>;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(
        @MessageBody() sessionId: string,
        @ConnectedSocket() client: Socket<ClientToServerEvents, ServerToClientEvents>,
    ) {
        client.join(sessionId);
        console.log(`Client ${client.id} joined session ${sessionId}`);
        return { status: 'joined', sessionId };
    }

    @SubscribeMessage('update_state')
    handleUpdateState(
        @MessageBody() data: { sessionId: string; filter?: string; frame?: string },
    ) {
        this.server.to(data.sessionId).emit('state_updated', data);
    }

    @SubscribeMessage('trigger_countdown')
    handleTriggerCountdown(@MessageBody() sessionId: string) {
        this.server.to(sessionId).emit('start_countdown');
    }

    @SubscribeMessage('capture_done')
    handleCaptureDone(
        @MessageBody() data: { sessionId: string; imageUrl: string },
    ) {
        this.server.to(data.sessionId).emit('show_result', { imageUrl: data.imageUrl });
    }

    // --- New Remote Control Handlers ---

    @SubscribeMessage('update_config')
    handleUpdateConfig(
        @MessageBody() data: { sessionId: string; selectedFrameId: string; selectedFilter: string },
    ) {
        // Broadcast to room (Monitor listens)
        this.server.to(data.sessionId).emit('update_config', data);
    }

    @SubscribeMessage('trigger_finish')
    handleTriggerFinish(@MessageBody() sessionId: string) {
        // Controller -> Monitor
        this.server.to(sessionId).emit('trigger_finish');
    }

    @SubscribeMessage('processing_start')
    handleProcessingStart(@MessageBody() sessionId: string) {
        // Monitor -> Controller
        this.server.to(sessionId).emit('processing_start');
    }

    @SubscribeMessage('processing_done')
    handleProcessingDone(@MessageBody() sessionId: string) {
        // Monitor -> Controller
        this.server.to(sessionId).emit('processing_done');
    }
}
