import { Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { DocumentStatusEntity, toDocumentStatusDto } from '@database';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger('NotificationGateway');
  private connectedClients: Map<string, Socket> = new Map();
  private socketServer!: Server;

  constructor() { }

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

  emitDocumentStatusUpdate(documentId: string, status: DocumentStatusEntity[]) {
    this.socketServer.emit('documentStatusUpdate', {
      documentId,
      status: status.map(toDocumentStatusDto),
    });
    this.logger.log(`Emitted status update for document ${documentId}`);
  }
}
