import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly notificationService: NotificationService) {}

  afterInit(server: Server) {
    this.notificationService.setServer(server);
  }

  handleConnection(client: Socket) {
    this.notificationService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.notificationService.handleDisconnect(client);
  }
}
