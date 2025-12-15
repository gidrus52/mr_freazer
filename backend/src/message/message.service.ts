import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, senderId: string): Promise<MessageResponseDto> {
    const message = await this.prisma.message.create({
      data: {
        ...createMessageDto,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
        advertisement: {
          select: {
            id: true,
            title: true,
          },
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return message;
  }

  async findAll(userId: string, query?: {
    conversationWith?: string;
    advertisementId?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ messages: MessageResponseDto[]; total: number }> {
    const { page = 1, limit = 20, ...filters } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    if (filters.conversationWith) {
      where.AND = [
        {
          OR: [
            { senderId: filters.conversationWith, receiverId: userId },
            { senderId: userId, receiverId: filters.conversationWith },
          ],
        },
      ];
    }

    if (filters.advertisementId) {
      where.advertisementId = filters.advertisementId;
    }

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
            },
          },
          advertisement: {
            select: {
              id: true,
              title: true,
            },
          },
          parentMessage: {
            select: {
              id: true,
              content: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { messages, total };
  }

  async findOne(id: string, userId: string): Promise<MessageResponseDto> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
        advertisement: {
          select: {
            id: true,
            title: true,
          },
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
          },
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому сообщению');
    }

    // Помечаем сообщение как прочитанное, если получатель его читает
    if (message.receiverId === userId && !message.isRead) {
      await this.prisma.message.update({
        where: { id },
        data: { isRead: true },
      });
      message.isRead = true;
    }

    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
  ): Promise<MessageResponseDto> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      select: { senderId: true },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои сообщения');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
        advertisement: {
          select: {
            id: true,
            title: true,
          },
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return updatedMessage;
  }

  async remove(id: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      select: { senderId: true },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои сообщения');
    }

    await this.prisma.message.delete({
      where: { id },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      select: { receiverId: true },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Вы можете помечать как прочитанные только сообщения, адресованные вам');
    }

    await this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async getConversations(userId: string): Promise<Array<{
    otherUserId: string;
    otherUserEmail: string;
    lastMessage: MessageResponseDto;
    unreadCount: number;
  }>> {
    // Получаем все уникальные собеседников пользователя
    const conversations = await this.prisma.message.groupBy({
      by: ['senderId', 'receiverId'],
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    });

    const result = [];

    for (const conversation of conversations) {
      const otherUserId = conversation.senderId === userId 
        ? conversation.receiverId 
        : conversation.senderId;

      // Получаем последнее сообщение в диалоге
      const lastMessage = await this.prisma.message.findFirst({
        where: {
          OR: [
            { senderId: otherUserId, receiverId: userId },
            { senderId: userId, receiverId: otherUserId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Считаем непрочитанные сообщения
      const unreadCount = await this.prisma.message.count({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false,
        },
      });

      // Получаем email собеседника
      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId },
        select: { email: true },
      });

      result.push({
        otherUserId,
        otherUserEmail: otherUser.email,
        lastMessage,
        unreadCount,
      });
    }

    // Сортируем по времени последнего сообщения
    result.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return result;
  }
}
