import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessagedto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  conversationId: number;
}
