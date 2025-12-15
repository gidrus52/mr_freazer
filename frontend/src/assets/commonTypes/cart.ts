import { Product } from '../../utils/api'

// Элемент корзины
export interface CartItem {
  id: string
  product: Product
  quantity: number
  addedAt: Date
}

// Состояние корзины
export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

// Действия корзины
export interface CartActions {
  addItem: (product: Product, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (productId: string | number) => number
}

// Контекст корзины
export interface CartContextType {
  cart: Cart
  actions: CartActions
}
