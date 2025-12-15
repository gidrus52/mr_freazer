import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto, OrderItemResponseDto } from './dto';
import { OrderStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, customerId: string): Promise<OrderResponseDto> {
    // Проверяем, что есть товары в заказе
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Заказ должен содержать хотя бы один товар');
    }

    // Получаем информацию о всех товарах в заказе
    const productIds = createOrderDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Один или несколько товаров не найдены');
    }

    // Проверяем наличие товаров на складе
    for (const item of createOrderDto.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Товар с ID "${item.productId}" не найден`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Недостаточно товара "${product.name}" на складе. Доступно: ${product.stock}, требуется: ${item.quantity}`);
      }
    }

    // Создаем заказ с позициями в транзакции
    const order = await this.prisma.$transaction(async (tx) => {
      // Генерируем номер заказа
      const orderNumber = await this.generateOrderNumber();
      
      // Создаем заказ
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          status: OrderStatus.PENDING,
          description: createOrderDto.description,
        },
      });

      // Создаем позиции заказа
      const orderItems = await Promise.all(
        createOrderDto.items.map(async (item) => {
          const product = products.find(p => p.id === item.productId);
          
          // Создаем позицию заказа
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price, // Сохраняем цену на момент заказа
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                },
              },
            },
          });

          // Уменьшаем количество товара на складе
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          return orderItem;
        })
      );

      return {
        ...newOrder,
        items: orderItems,
      };
    });

    // Получаем полную информацию о заказе
    return this.findOne(order.id);
  }

  async findAll(customerId?: string): Promise<OrderResponseDto[]> {
    const where = customerId ? { customerId } : {};
    
    // Сначала обновляем статусы заказов, которым исполнилось 30 дней
    await this.checkAndUpdateExpiredOrders();
    
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            roles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Добавляем вычисляемые поля
    return orders.map(order => this.addCalculatedFields(order));
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    // Сначала обновляем статусы заказов, которым исполнилось 30 дней
    await this.checkAndUpdateExpiredOrders();
    
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            roles: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return this.addCalculatedFields(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...updateOrderDto,
        completedAt: updateOrderDto.status === OrderStatus.COMPLETED ? new Date() : null,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            roles: true,
          },
        },
      },
    });

    return this.addCalculatedFields(updatedOrder);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);

    // Возвращаем все товары на склад в транзакции
    await this.prisma.$transaction(async (tx) => {
      // Возвращаем товары на склад
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Удаляем заказ (позиции удалятся автоматически из-за onDelete: Cascade)
      await tx.order.delete({
        where: { id },
      });
    });
  }

  // Проверка и обновление статуса заказов через 30 дней
  private async checkAndUpdateExpiredOrders(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prisma.order.updateMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.IN_PROGRESS],
        },
        createdAt: {
          lte: thirtyDaysAgo,
        },
      },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  // Автоматическое обновление статуса заказов через 30 дней (cron задача)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCompleteOrders(): Promise<void> {
    await this.checkAndUpdateExpiredOrders();
  }

  // Добавление вычисляемых полей к заказу
  private addCalculatedFields(order: any): OrderResponseDto {
    const totalAmount = order.items.reduce((sum: number, item: any) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);

    const totalItems = order.items.reduce((sum: number, item: any) => {
      return sum + item.quantity;
    }, 0);

    return {
      ...order,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalItems,
    };
  }

  // Генерация номера заказа в формате ДДММГГГГВРЕМЯ_порядковый_номер
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const dateTime = `${day}${month}${year}${hours}${minutes}${seconds}`;
    
    // Получаем количество заказов за сегодня для генерации порядкового номера
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todayOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });
    
    const sequenceNumber = (todayOrdersCount + 1).toString().padStart(4, '0');
    
    return `${dateTime}_${sequenceNumber}`;
  }
}
