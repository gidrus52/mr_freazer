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
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Roles, Public } from '@common/decorators';
import { RolesGuard } from '@auth/guargs/role.guard';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Delete(':id/soft')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  softDelete(@Param('id') id: string) {
    return this.productService.softDelete(id);
  }
} 