import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guargs/jwt-auth.guard';
import { RolesGuard } from '../auth/guargs/role.guard';
import { Roles } from '../../libs/common/src/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.orderService.create(createOrderDto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query('all') all?: string) {
    // Если пользователь админ и указан параметр all=true, показываем все заказы
    if (req.user.roles.includes(Role.ADMIN) && all === 'true') {
      return this.orderService.findAll();
    }
    // Иначе показываем только заказы текущего пользователя
    return this.orderService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
