import { Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger('NotificationService');
  private connectedClients: Map<string, Socket> = new Map();
  private socketServer!: Server;

  constructor() {}

  setServer(server: Server) {
    this.socketServer = server;
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitFileStatusUpdate(fileId: string, status: string) {
    this.socketServer.emit('fileStatusUpdate', {
      fileId,
      status,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Emitted status update for file ${fileId}: ${status}`);
  }
}
