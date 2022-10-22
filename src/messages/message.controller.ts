import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from '../utils/constants';
import { AuthUser } from '../utils/decorator';
import { User } from '../utils/typeorm';
import { CreateMessagedto } from './dtos/CreateMessage.dto';
import { IMessageService } from './message';

@Controller(Routes.MESSAGES)
export class MessageController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessageService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  createMessage(
    @AuthUser() user: User,
    @Body() createMessageDto: CreateMessagedto,
  ) {
    const msg = this.messageService.createMessage({
      ...createMessageDto,
      user,
    });
    this.eventEmitter.emit('message.create', msg);
    return;
  }

  @Get(':conversationId')
  getMessagesFromConversation(
    @AuthUser() user: User,
    @Param('conversationId') conversationId: number,
  ) {
    return this.messageService.getMessagesByCovnersationId(conversationId);
  }
}
