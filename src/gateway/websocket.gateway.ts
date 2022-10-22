import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(client: Socket, ...args: any[]) {
    console.log('new Connection');
    console.log(client.id);
    client.emit('connected', { status: 'good' });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create a message');
    console.log(data);
  }

  @OnEvent('message.create')
  async handleMessageCreateEvent(payload: any) {
    // console.log(await payload);

    this.server.emit('onMessage', await payload);
  }
}
