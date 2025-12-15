import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Order, OrderItem, OrderStatus, CartItem } from '../assets/commonTypes'
import { createOrder, getOrders, getOrder, updateOrderStatus, CreateOrderRequest, CreateOrderResponse } from '../utils/api'

export const useOrderStore = defineStore('orders', () => {
  // Состояние заказов
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Вычисляемые свойства
  const totalOrders = computed(() => orders.value.length)
  
  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'PENDING')
  )
  
  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'DELIVERED')
  )

  // Преобразование ответа сервера в локальный формат
  const transformServerOrder = (serverOrder: CreateOrderResponse): Order => {
    return {
      id: serverOrder.id,
      customerId: serverOrder.customerId,
      status: serverOrder.status as OrderStatus,
      description: serverOrder.description,
      totalAmount: serverOrder.totalAmount,
      totalItems: serverOrder.totalItems,
      items: serverOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.product.name,
          price: item.product.price
        }
      })),
      createdAt: new Date(serverOrder.createdAt)
    }
  }

  // Создание заказа на сервере
  const createOrderOnServer = async (cartItems: CartItem[], customerId: string, description?: string): Promise<Order | null> => {
    loading.value = true
    error.value = null

    try {
      console.log('📦 Создаем заказ на сервере из корзины:', cartItems)
      
      // Преобразуем элементы корзины в формат для сервера
      const orderData: CreateOrderRequest = {
        customerId,
        description: description || `Заказ с ${cartItems.length} товарами`,
        items: cartItems.map(cartItem => ({
          productId: cartItem.product.id || cartItem.product.name,
          quantity: cartItem.quantity,
          price: cartItem.product.price || 0
        }))
      }

      console.log('📤 Отправляем данные на сервер:', orderData)

      const response = await createOrder(orderData)
      
      if (response.success && response.data) {
        const newOrder = transformServerOrder(response.data)
        orders.value.push(newOrder)
        
        console.log('✅ Заказ успешно создан на сервере:', newOrder)
        return newOrder
      } else {
        error.value = response.message || 'Ошибка при создании заказа'
        console.error('❌ Ошибка создания заказа:', response.message)
        return null
      }
    } catch (err) {
      error.value = 'Ошибка сети при создании заказа'
      console.error('❌ Ошибка сети при создании заказа:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Загрузка заказов с сервера
  const loadOrdersFromServer = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      console.log('📥 Загружаем заказы с сервера...')
      
      const response = await getOrders()
      console.log('📋 Ответ от getOrders:', response)
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          orders.value = response.data.map(transformServerOrder)
          console.log('✅ Заказы загружены с сервера:', orders.value.length)
        } else {
          error.value = 'Неверный формат данных заказов'
          console.error('❌ Данные заказов не являются массивом:', response.data)
        }
      } else {
        error.value = response.message || 'Ошибка при загрузке заказов'
        console.error('❌ Ошибка загрузки заказов:', {
          success: response.success,
          message: response.message,
          statusCode: response.statusCode,
          data: response.data
        })
      }
    } catch (err) {
      error.value = `Ошибка сети при загрузке заказов: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`
      console.error('❌ Ошибка сети при загрузке заказов:', err)
    } finally {
      loading.value = false
    }
  }

  // Обновление статуса заказа на сервере
  const updateOrderStatusOnServer = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      console.log(`📝 Обновляем статус заказа ${orderId} на ${status}`)
      
      const response = await updateOrderStatus(orderId, status)
      
      if (response.success && response.data) {
        // Обновляем заказ в локальном состоянии
        const orderIndex = orders.value.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex] = transformServerOrder(response.data)
        }
        
        console.log('✅ Статус заказа обновлен на сервере')
        return true
      } else {
        error.value = response.message || 'Ошибка при обновлении статуса заказа'
        console.error('❌ Ошибка обновления статуса заказа:', response.message)
        return false
      }
    } catch (err) {
      error.value = 'Ошибка сети при обновлении статуса заказа'
      console.error('❌ Ошибка сети при обновлении статуса заказа:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Получение заказа по ID
  const getOrderById = (orderId: string): Order | null => {
    return orders.value.find(o => o.id === orderId) || null
  }

  // Очистка ошибок
  const clearError = () => {
    error.value = null
  }

  return {
    orders,
    loading,
    error,
    totalOrders,
    pendingOrders,
    completedOrders,
    createOrderOnServer,
    loadOrdersFromServer,
    updateOrderStatusOnServer,
    getOrderById,
    clearError
  }
})
