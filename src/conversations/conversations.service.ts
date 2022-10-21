import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IParticipansService } from '../participants/participants';
import { IUserService } from '../users/user';
import { Services } from '../utils/constants';
import { Conversation, Participant, User } from '../utils/typeorm';
import { CreateConversationParams } from '../utils/types';
import { IConversationsService } from './conversations';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.PARTICIPANTS)
    private readonly participantsService: IParticipansService,
    @Inject(Services.USERS)
    private readonly userService: IUserService,
  ) {}

  async createConversation(user: User, params: CreateConversationParams) {
    // const author = await this.participantsService.findParticipant();
    const userDB = await this.userService.findUser({ id: user.id });
    const { authorId, recipientId } = params;
    const participants: Participant[] = [];
    if (!userDB.participant) {
      const participant = await this.createParticipantAndSaveUser(
        userDB,
        params.authorId,
      );
      participants.push(participant);
    } else participants.push(userDB.participant);

    const recipient = await this.userService.findUser({
      id: recipientId,
    });
    if (!recipient)
      throw new HttpException('Recipient not Foud', HttpStatus.BAD_REQUEST);
    if (!recipient.participant) {
      const participant = await this.createParticipantAndSaveUser(
        recipient,
        recipientId,
      );
      participants.push(participant);
    } else participants.push(recipient.participant);

    const conversation = this.conversationRepository.create({ participants });
    return this.conversationRepository.save(conversation);
  }

  public async createParticipantAndSaveUser(user: User, id: number) {
    const participant = await this.participantsService.createPartipant({
      id,
    });
    user.participant = participant;
    await this.userService.saveUser(user);
    return participant;
  }
}
