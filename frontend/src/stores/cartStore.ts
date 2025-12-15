import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CartItem, Cart, CartActions } from '../assets/commonTypes'
import { Product } from '../utils/api'

export const useCartStore = defineStore('cart', () => {
  // Состояние корзины
  const items = ref<CartItem[]>([])

  // Вычисляемые свойства
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.product.price || 0) * item.quantity
    }, 0)
  })

  const cart = computed<Cart>(() => ({
    items: items.value,
    totalItems: totalItems.value,
    totalPrice: totalPrice.value
  }))

  // Действия корзины
  const addItem = (product: Product, quantity: number = 1) => {
    console.log('🛒 Добавляем товар в корзину:', product, 'количество:', quantity)
    
    const existingItemIndex = items.value.findIndex(
      item => item.product.id === product.id
    )

    if (existingItemIndex !== -1) {
      // Товар уже есть в корзине, увеличиваем количество
      items.value[existingItemIndex].quantity += quantity
      console.log('✅ Увеличили количество существующего товара')
    } else {
      // Добавляем новый товар в корзину
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`, // Уникальный ID
        product,
        quantity,
        addedAt: new Date()
      }
      items.value.push(newItem)
      console.log('✅ Добавили новый товар в корзину')
    }

    console.log('📊 Текущее состояние корзины:', {
      items: items.value.length,
      totalItems: totalItems.value,
      totalPrice: totalPrice.value
    })

    // Сохраняем в localStorage
    saveToLocalStorage()
  }

  const removeItem = (itemId: string) => {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index !== -1) {
      items.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        item.quantity = quantity
        saveToLocalStorage()
      }
    }
  }

  const clearCart = () => {
    items.value = []
    saveToLocalStorage()
  }

  const getItemQuantity = (productId: string | number): number => {
    const item = items.value.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  // Сохранение в localStorage
  const saveToLocalStorage = () => {
    try {
      const cartData = JSON.stringify(items.value)
      localStorage.setItem('cart', cartData)
      console.log('💾 Корзина сохранена в localStorage:', cartData)
    } catch (error) {
      console.error('❌ Ошибка сохранения корзины в localStorage:', error)
    }
  }

  // Загрузка из localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      console.log('📥 Загружаем корзину из localStorage:', savedCart)
      
      if (savedCart) {
        const parsedItems = JSON.parse(savedCart)
        // Восстанавливаем даты
        items.value = parsedItems.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
        console.log('✅ Корзина загружена из localStorage:', items.value)
      } else {
        console.log('📭 localStorage пуст, создаем пустую корзину')
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки корзины из localStorage:', error)
      items.value = []
    }
  }

  // Инициализация - загружаем из localStorage
  loadFromLocalStorage()

  const actions: CartActions = {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity
  }

  return {
    cart,
    actions,
    // Экспортируем отдельные методы для удобства
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    loadFromLocalStorage
  }
})
