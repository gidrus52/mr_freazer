export class MessageResponseDto {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  sender: {
    id: string;
    email: string;
  };
  
  receiver: {
    id: string;
    email: string;
  };
  
  advertisement?: {
    id: string;
    title: string;
  };
  
  parentMessage?: {
    id: string;
    content: string;
  };
  
  replies?: MessageResponseDto[];
}
