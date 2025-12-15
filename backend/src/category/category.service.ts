import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Проверяем уникальность имени
    const existingCategory = await this.prismaService.category.findFirst({
      where: {
        name: {
          equals: createCategoryDto.name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingCategory) {
      throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists`);
    }

    // Если указан parentId, проверяем его существование
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prismaService.category.findUnique({
        where: { id: createCategoryDto.parentId }
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found`);
      }
    }

    return this.prismaService.category.create({
      data: createCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prismaService.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.prismaService.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true }
            }
          }
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findSubcategories(parentId: string): Promise<Category[]> {
    // Проверяем существование родительской категории
    const parentCategory = await this.prismaService.category.findUnique({
      where: { id: parentId }
    });

    if (!parentCategory) {
      throw new NotFoundException(`Parent category with ID ${parentId} not found`);
    }

    return this.prismaService.category.findMany({
      where: {
        isActive: true,
        parentId: parentId,
      },
      include: {
        children: {
          where: { isActive: true }
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true }
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.prismaService.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        isActive: true,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Проверяем существование категории
    await this.findOne(id);

    // Проверяем уникальность имени при обновлении
    if (updateCategoryDto.name) {
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive'
          },
          id: {
            not: id
          }
        }
      });
      
      if (existingCategory) {
        throw new ConflictException(`Category with name "${updateCategoryDto.name}" already exists`);
      }
    }

    // Если указан parentId, проверяем его существование и предотвращаем циклические ссылки
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.prismaService.category.findUnique({
        where: { id: updateCategoryDto.parentId }
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
      }

      // Проверяем, что новая родительская категория не является потомком текущей категории
      const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
      if (isDescendant) {
        throw new BadRequestException('Cannot set a descendant category as parent');
      }
    }

    return this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: {
          where: { isActive: true }
        },
      },
    });
  }

  private async isDescendant(categoryId: string, potentialParentId: string): Promise<boolean> {
    const children = await this.prismaService.category.findMany({
      where: { parentId: categoryId }
    });

    for (const child of children) {
      if (child.id === potentialParentId) {
        return true;
      }
      
      const isDescendant = await this.isDescendant(child.id, potentialParentId);
      if (isDescendant) {
        return true;
      }
    }

    return false;
  }

  async remove(id: string): Promise<{ id: string }> {
    // Проверяем существование категории
    await this.findOne(id);

    return this.prismaService.category.delete({
      where: { id },
      select: { id: true },
    });
  }

  async softDelete(id: string): Promise<Category> {
    // Проверяем существование категории
    await this.findOne(id);

    return this.prismaService.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Получает полную иерархию категорий в виде дерева
   */
  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.prismaService.category.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: {
                children: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Фильтруем только корневые категории
    return categories.filter(category => !category.parentId);
  }

  /**
   * Получает путь к категории (все родительские категории)
   */
  async getCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentId = categoryId;

    while (currentId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: currentId },
        include: { parent: true }
      });

      if (!category) break;

      path.unshift(category);
      currentId = category.parentId;
    }

    return path;
  }

  /**
   * Получает все дочерние категории (включая вложенные)
   */
  async getAllDescendants(categoryId: string): Promise<Category[]> {
    const descendants: Category[] = [];
    
    const children = await this.prismaService.category.findMany({
      where: { 
        parentId: categoryId,
        isActive: true 
      }
    });

    for (const child of children) {
      descendants.push(child);
      const childDescendants = await this.getAllDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  /**
   * Получает уровень категории в иерархии
   */
  async getCategoryLevel(categoryId: string): Promise<number> {
    const path = await this.getCategoryPath(categoryId);
    return path.length - 1; // 0 для корневых категорий
  }

  /**
   * Проверяет, является ли категория листовой (не имеет дочерних)
   */
  async isLeafCategory(categoryId: string): Promise<boolean> {
    const childrenCount = await this.prismaService.category.count({
      where: { 
        parentId: categoryId,
        isActive: true 
      }
    });
    
    return childrenCount === 0;
  }

  /**
   * Получает статистику по категориям
   */
  async getCategoryStats(): Promise<{
    totalCategories: number;
    rootCategories: number;
    leafCategories: number;
    maxDepth: number;
    categoriesByLevel: { [level: number]: number };
  }> {
    const allCategories = await this.prismaService.category.findMany({
      where: { isActive: true },
      include: { parent: true }
    });

    const rootCategories = allCategories.filter(c => !c.parentId);
    const leafCategories = allCategories.filter(c => 
      !allCategories.some(child => child.parentId === c.id)
    );

    const categoriesByLevel: { [level: number]: number } = {};
    let maxDepth = 0;

    for (const category of allCategories) {
      const level = await this.getCategoryLevel(category.id);
      categoriesByLevel[level] = (categoriesByLevel[level] || 0) + 1;
      maxDepth = Math.max(maxDepth, level);
    }

    return {
      totalCategories: allCategories.length,
      rootCategories: rootCategories.length,
      leafCategories: leafCategories.length,
      maxDepth,
      categoriesByLevel
    };
  }
} 