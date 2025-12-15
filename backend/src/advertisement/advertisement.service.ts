import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdvertisementResponseDto } from './dto/advertisement-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdvertisementService {
  constructor(private readonly prisma: PrismaService) {}

  private convertDecimalToNumber(value: Decimal | null): number | undefined {
    return value ? Number(value) : undefined;
  }

  private transformAdvertisement(advertisement: any): AdvertisementResponseDto {
    return {
      ...advertisement,
      price: this.convertDecimalToNumber(advertisement.price),
    };
  }

  async create(createAdvertisementDto: CreateAdvertisementDto, userId: string): Promise<AdvertisementResponseDto> {
    const advertisement = await this.prisma.advertisement.create({
      data: {
        ...createAdvertisementDto,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.transformAdvertisement(advertisement);
  }

  async findAll(query?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ advertisements: AdvertisementResponseDto[]; total: number }> {
    const { page = 1, limit = 10, ...filters } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [advertisements, total] = await Promise.all([
      this.prisma.advertisement.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            take: 1, // Только первое изображение для списка
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.advertisement.count({ where }),
    ]);

    return { 
      advertisements: advertisements.map(ad => this.transformAdvertisement(ad)), 
      total 
    };
  }

  async findOne(id: string): Promise<AdvertisementResponseDto> {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!advertisement) {
      throw new NotFoundException('Объявление не найдено');
    }

    // Увеличиваем счетчик просмотров
    await this.prisma.advertisement.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return this.transformAdvertisement(advertisement);
  }

  async update(
    id: string,
    updateAdvertisementDto: UpdateAdvertisementDto,
    userId: string,
  ): Promise<AdvertisementResponseDto> {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!advertisement) {
      throw new NotFoundException('Объявление не найдено');
    }

    if (advertisement.authorId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои объявления');
    }

    const updatedAdvertisement = await this.prisma.advertisement.update({
      where: { id },
      data: updateAdvertisementDto,
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.transformAdvertisement(updatedAdvertisement);
  }

  async remove(id: string, userId: string): Promise<void> {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!advertisement) {
      throw new NotFoundException('Объявление не найдено');
    }

    if (advertisement.authorId !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои объявления');
    }

    await this.prisma.advertisement.delete({
      where: { id },
    });
  }

  async findByUser(userId: string): Promise<AdvertisementResponseDto[]> {
    const advertisements = await this.prisma.advertisement.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return advertisements.map(ad => this.transformAdvertisement(ad));
  }
}
