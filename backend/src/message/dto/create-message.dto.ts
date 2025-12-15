import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  receiverId: string;

  @IsOptional()
  @IsUUID()
  advertisementId?: string;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;
}
