import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        throw new BadRequestException('Token not found');
      }
      const payload = this.jwtService.verify(token);

      client.data.user = payload;

      console.log('User connected: ', payload);

      client.join(`room-${payload.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room-${data.conversationId}`);
    return { message: 'joined room' };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;

    const message = await this.messageService.sendMessage(
      user.id,
      data.content,
    );

    this.server.to(`room-${message.conversationId}`).emit('message', message);

    return message;
  }
}
