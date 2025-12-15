import { Product } from '../../utils/api'

// Статусы заказа
export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

// Элемент заказа
export interface OrderItem {
  id: string
  productId: string | number
  quantity: number
  price: number
  product: {
    name: string
    price: number
  }
}

// Заказ
export interface Order {
  id: string
  customerId: string
  status: OrderStatus
  description?: string
  totalAmount: number
  totalItems: number
  items: OrderItem[]
  createdAt: Date
  updatedAt?: Date
}

// Запрос на создание заказа (для отправки на сервер)
export interface CreateOrderRequest {
  customerId: string
  description?: string
  items: {
    productId: string | number
    quantity: number
    price: number
  }[]
}

// Ответ сервера при создании заказа
export interface CreateOrderResponse {
  id: string
  customerId: string
  status: OrderStatus
  description?: string
  totalAmount: number
  totalItems: number
  items: OrderItem[]
  createdAt: string
}
