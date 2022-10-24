import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Services } from '../utils/constants';
import { AuthenticatedSocket } from '../utils/interfaces';
import { Message } from '../utils/typeorm';
import { IGatewaySessionManager } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly sessions: IGatewaySessionManager,
  ) {}
  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log('new Connection');
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', { status: 'good' });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create a message');
    console.log(data);
  }

  @OnEvent('message.create')
  async handleMessageCreateEvent(payload: Message) {
    // console.log(await payload);
    const {
      author,
      conversation: { creator, recipient },
    } = await payload;
    const authorSocket = this.sessions.getUserSocket(author.id);
    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(recipient.id)
        : this.sessions.getUserSocket(creator.id);
    recipientSocket.emit('onMessage', await payload);
    authorSocket.emit('onMessage', await payload);
  }
}
