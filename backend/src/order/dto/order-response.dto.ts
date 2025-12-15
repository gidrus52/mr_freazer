import { OrderStatus, Role } from '@prisma/client';

export class OrderItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
}

export class OrderResponseDto {
  id: string;
  orderNumber: string; // Номер заказа
  customerId: string;
  status: OrderStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Позиции заказа
  items: OrderItemResponseDto[];
  
  customer?: {
    id: string;
    email: string;
    roles: Role[]; // Роли пользователя
  };
  
  // Вычисляемые поля
  totalAmount?: number; // Общая сумма заказа
  totalItems?: number;  // Общее количество товаров
}
