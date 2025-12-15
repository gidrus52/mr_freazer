import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateImageDto, UpdateImageDto } from './dto';
import { Image } from '@prisma/client';

@Injectable()
export class ImageService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    // Проверяем существование продукта
    const product = await this.prismaService.product.findUnique({
      where: { id: createImageDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createImageDto.productId} not found`);
    }

    // Если это основное изображение, сбрасываем флаг у других изображений этого продукта
    if (createImageDto.isPrimary) {
      await this.prismaService.image.updateMany({
        where: { productId: createImageDto.productId },
        data: { isPrimary: false },
      });
    }

    return this.prismaService.image.create({
      data: createImageDto,
      include: {
        product: true,
      },
    });
  }

  async findAll(): Promise<Image[]> {
    return this.prismaService.image.findMany({
      where: {
        isActive: true,
      },
      include: {
        product: true,
      },
      orderBy: [
        { productId: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findByProductId(productId: string): Promise<Image[]> {
    // Проверяем существование продукта
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.prismaService.image.findMany({
      where: {
        productId,
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string): Promise<Image> {
    const image = await this.prismaService.image.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    // Проверяем существование изображения
    await this.findOne(id);

    // Если это основное изображение, сбрасываем флаг у других изображений этого продукта
    if (updateImageDto.isPrimary) {
      const image = await this.findOne(id);
      await this.prismaService.image.updateMany({
        where: { 
          productId: image.productId,
          id: { not: id }
        },
        data: { isPrimary: false },
      });
    }

    return this.prismaService.image.update({
      where: { id },
      data: updateImageDto,
      include: {
        product: true,
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    // Проверяем существование изображения
    await this.findOne(id);

    return this.prismaService.image.delete({
      where: { id },
      select: { id: true },
    });
  }

  async softDelete(id: string): Promise<Image> {
    // Проверяем существование изображения
    await this.findOne(id);

    return this.prismaService.image.update({
      where: { id },
      data: { isActive: false },
      include: {
        product: true,
      },
    });
  }

  async setPrimary(id: string): Promise<Image> {
    const image = await this.findOne(id);

    // Сбрасываем флаг основного изображения у всех изображений этого продукта
    await this.prismaService.image.updateMany({
      where: { productId: image.productId },
      data: { isPrimary: false },
    });

    // Устанавливаем текущее изображение как основное
    return this.prismaService.image.update({
      where: { id },
      data: { isPrimary: true },
      include: {
        product: true,
      },
    });
  }
}
