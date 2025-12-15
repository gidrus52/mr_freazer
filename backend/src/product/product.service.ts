import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Проверяем, что categoryId передан
    if (!createProductDto.categoryId) {
      throw new NotFoundException('Category ID is required');
    }

    // Проверяем существование категории
    const category = await this.prismaService.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createProductDto.categoryId} not found`);
    }

    return this.prismaService.product.create({
      data: createProductDto,
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });
  }

  async findAll(): Promise<Product[]> {
    return this.prismaService.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Проверяем существование продукта
    await this.findOne(id);

    // Проверяем существование категории при обновлении
    if (updateProductDto.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
      }
    }

    return this.prismaService.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    // Проверяем существование продукта
    await this.findOne(id);

    return this.prismaService.product.delete({
      where: { id },
      select: { id: true },
    });
  }

  async softDelete(id: string): Promise<Product> {
    // Проверяем существование продукта
    await this.findOne(id);

    return this.prismaService.product.update({
      where: { id },
      data: { isActive: false },
      include: {
        category: true,
        images: {
          where: { isActive: true },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });
  }
} 