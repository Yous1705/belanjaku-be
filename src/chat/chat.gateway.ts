import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      console.log('TOKEN:', token);

      if (!token) {
        throw new WsException('Token not found');
      }

      const payload = await this.jwtService.verifyAsync(token);

      console.log('PAYLOAD:', payload);

      client.data.user = payload;

      console.log('Connected:', payload.sub);
    } catch (error) {
      console.log('SOCKET ERROR:', error);

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody()
    data: {
      conversationId: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    const canAccess = await this.messageService.canAccessConversation(
      data.conversationId,
      user.sub,
      user.role,
    );

    if (!canAccess) {
      throw new WsException('Forbidden');
    }

    client.join(`room-${data.conversationId}`);

    return {
      message: 'joined room',
    };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: number;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    if (!data.content?.trim()) {
      throw new WsException('Message content is required');
    }

    const canAccess = await this.messageService.canAccessConversation(
      data.conversationId,
      user.sub,
      user.role,
    );

    if (!canAccess) {
      throw new WsException('Forbidden');
    }

    const message = await this.messageService.sendMessage(
      data.conversationId,
      user.sub,
      data.content.trim(),
    );

    this.server.to(`room-${data.conversationId}`).emit('message', message);

    return message;
  }
}
