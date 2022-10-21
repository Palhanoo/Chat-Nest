import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { Conversation, Message, User } from '../utils/typeorm';
import { CreateMessageParams } from '../utils/types';
import { IMessageService } from './message';

@Injectable()
export class MessageService implements IMessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}
  async createMessage({
    user,
    content,
    conversationId,
  }: CreateMessageParams): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['creator', 'recipient'],
    });
    console.log(conversation);
    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    const { creator, recipient } = conversation;
    if (creator.id !== user.id && recipient.id !== user.id)
      throw new HttpException('Cannot create message', HttpStatus.FORBIDDEN);
    conversation.creator = instanceToPlain(conversation.creator) as User;
    conversation.recipient = instanceToPlain(conversation.recipient) as User;
    const newMessage = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
    });
    console.log(newMessage);
    return await this.messageRepository.save(newMessage);
  }
}
