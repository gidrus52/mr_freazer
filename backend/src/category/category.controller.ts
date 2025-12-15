import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Roles, Public } from '@common/decorators';
import { RolesGuard } from '@auth/guargs/role.guard';
import { Role } from '@prisma/client';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('root')
  @Public()
  findRootCategories() {
    return this.categoryService.findRootCategories();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get(':id/subcategories')
  @Public()
  findSubcategories(@Param('id') id: string) {
    return this.categoryService.findSubcategories(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  softDelete(@Param('id') id: string) {
    return this.categoryService.softDelete(id);
  }

  @Get('tree')
  @Public()
  getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @Get(':id/path')
  @Public()
  getCategoryPath(@Param('id') id: string) {
    return this.categoryService.getCategoryPath(id);
  }

  @Get(':id/descendants')
  @Public()
  getAllDescendants(@Param('id') id: string) {
    return this.categoryService.getAllDescendants(id);
  }

  @Get(':id/level')
  @Public()
  getCategoryLevel(@Param('id') id: string) {
    return this.categoryService.getCategoryLevel(id);
  }

  @Get(':id/is-leaf')
  @Public()
  isLeafCategory(@Param('id') id: string) {
    return this.categoryService.isLeafCategory(id);
  }

  @Get('stats')
  @Public()
  getCategoryStats() {
    return this.categoryService.getCategoryStats();
  }
} 