import { Participant } from '../utils/typeorm';
import { CreateParticipantParams, FindParticipantParams } from '../utils/types';

export interface IParticipansService {
  findParticipant(params: FindParticipantParams): Promise<Participant | null>;
  createPartipant(params: CreateParticipantParams): Promise<Participant>;
}
