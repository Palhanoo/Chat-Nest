import { Body, Controller, Inject, Post } from '@nestjs/common';
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
  ) {}

  @Post()
  createMessage(
    @AuthUser() user: User,
    @Body() createMessageDto: CreateMessagedto,
  ) {
    return this.messageService.createMessage({ ...createMessageDto, user });
  }
}
