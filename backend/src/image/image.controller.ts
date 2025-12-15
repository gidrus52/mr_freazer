import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto, UpdateImageDto } from './dto';
import { JwtAuthGuard } from '../auth/guargs/jwt-auth.guard';
import { RolesGuard } from '../auth/guargs/role.guard';
import { Roles } from '../../libs/common/src/decorators/roles.decorator';
import { Public } from '../../libs/common/src/decorators/public.decortor';
import { Role } from '@prisma/client';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createImageDto: CreateImageDto) {
    return this.imageService.create(createImageDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.imageService.findAll();
  }

  @Get('product/:productId')
  @Public()
  findByProductId(@Param('productId') productId: string) {
    return this.imageService.findByProductId(productId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imageService.update(id, updateImageDto);
  }

  @Patch(':id/primary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setPrimary(@Param('id') id: string) {
    return this.imageService.setPrimary(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.imageService.remove(id);
  }

  @Delete(':id/soft')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  softDelete(@Param('id') id: string) {
    return this.imageService.softDelete(id);
  }
}
