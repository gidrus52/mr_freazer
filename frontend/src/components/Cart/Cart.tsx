import { defineComponent, computed } from 'vue'
import { NModal, NCard, NButton, NInputNumber, NDivider, NGrid, NGridItem, useMessage } from 'naive-ui'
import { useCartStore } from '../../stores/cartStore'
import { useOrderStore } from '../../stores/orderStore'

export default defineComponent({
  name: 'Cart',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const cartStore = useCartStore()
    const orderStore = useOrderStore()
    const message = useMessage()

    const isVisible = computed({
      get: () => props.show,
      set: (value: boolean) => emit('update:show', value)
    })

    const handleClose = () => {
      isVisible.value = false
    }

    const handleQuantityChange = (itemId: string, quantity: number) => {
      cartStore.updateQuantity(itemId, quantity)
    }

    const handleRemoveItem = (itemId: string) => {
      cartStore.removeItem(itemId)
    }

    const handleClearCart = () => {
      cartStore.clearCart()
    }

    const handleCreateOrder = async () => {
      if (cartStore.cart.items.length === 0) {
        message.warning('Корзина пуста!')
        return
      }

      try {
        // Создаем заказ на сервере
        const order = await orderStore.createOrderOnServer(
          cartStore.cart.items,
          'user-uuid', // В реальном приложении это будет ID текущего пользователя
          'Заказ с сайта'
        )

        if (order) {
          // Очищаем корзину после успешного создания заказа
          cartStore.clearCart()

          // Закрываем корзину
          isVisible.value = false

          message.success(`Заказ #${order.id} успешно создан!`)
          console.log('✅ Заказ создан:', order)
        } else {
          message.error(orderStore.error || 'Ошибка при создании заказа')
        }
      } catch (error) {
        console.error('❌ Ошибка создания заказа:', error)
        message.error('Ошибка при создании заказа')
      }
    }

    const formatPrice = (price: number) => {
      return price.toLocaleString('ru-RU') + ' ₽'
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }

    return {
      cartStore,
      orderStore,
      isVisible,
      handleClose,
      handleQuantityChange,
      handleRemoveItem,
      handleClearCart,
      handleCreateOrder,
      formatPrice,
      formatDate
    }
  },
  render() {
    return (
      <NModal
        show={this.isVisible}
        preset="card"
        title="🛒 Корзина покупок"
        size="large"
        style={{ width: '800px' }}
        onClose={this.handleClose}
        onUpdate:show={(value: boolean) => this.isVisible = value}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {this.cartStore.cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                Корзина пуста
              </div>
              <NButton type="primary" onClick={this.handleClose}>
                Продолжить покупки
              </NButton>
            </div>
          ) : (
            <div>
              {/* Список товаров */}
              <div style={{ marginBottom: '20px' }}>
                {this.cartStore.cart.items.map((item) => (
                  <NCard
                    key={item.id}
                    style={{
                      marginBottom: '15px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <NGrid cols={12} xGap={12}>
                      {/* Изображение товара */}
                      <NGridItem span={3}>
                        <div style={{
                          width: '100%',
                          height: '80px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <div style={{ fontSize: '24px', color: '#6c757d' }}>📦</div>
                        </div>
                      </NGridItem>

                      {/* Информация о товаре */}
                      <NGridItem span={6}>
                        <div>
                          <h4 style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#212529'
                          }}>
                            {item.product.name}
                          </h4>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: '#6c757d',
                            lineHeight: '1.4'
                          }}>
                            {item.product.description || 'Описание отсутствует'}
                          </p>
                          <div style={{
                            fontSize: '12px',
                            color: '#6c757d'
                          }}>
                            Добавлено: {this.formatDate(item.addedAt)}
                          </div>
                        </div>
                      </NGridItem>

                      {/* Управление количеством и цена */}
                      <NGridItem span={3}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#28a745',
                            marginBottom: '10px'
                          }}>
                            {this.formatPrice((item.product.price || 0) * item.quantity)}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6c757d',
                            marginBottom: '10px'
                          }}>
                            {this.formatPrice(item.product.price || 0)} × {item.quantity}
                          </div>
                          <NInputNumber
                            value={item.quantity}
                            min={1}
                            max={999}
                            size="small"
                            style={{ width: '80px', marginBottom: '8px' }}
                            onUpdateValue={(value) => this.handleQuantityChange(item.id, value || 1)}
                          />
                        </div>
                      </NGridItem>
                    </NGrid>

                    {/* Кнопка удаления */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px'
                    }}>
                      <NButton
                        size="small"
                        type="error"
                        ghost
                        onClick={() => this.handleRemoveItem(item.id)}
                        style={{ minWidth: '32px', height: '32px' }}
                      >
                        🗑️
                      </NButton>
                    </div>
                  </NCard>
                ))}
              </div>

              <NDivider />

              {/* Итоговая информация */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <NGrid cols={12} xGap={12}>
                  <NGridItem span={8}>
                    <div style={{ fontSize: '16px', color: '#495057' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Товаров в корзине:</strong> {this.cartStore.cart.totalItems} шт.
                      </div>
                      <div>
                        <strong>Общая стоимость:</strong>
                      </div>
                    </div>
                  </NGridItem>
                  <NGridItem span={4}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#28a745'
                      }}>
                        {this.formatPrice(this.cartStore.cart.totalPrice)}
                      </div>
                    </div>
                  </NGridItem>
                </NGrid>
              </div>

              {/* Кнопки действий */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'space-between',
                marginTop: '20px'
              }}>
                <NButton
                  type="error"
                  ghost
                  onClick={this.handleClearCart}
                >
                  🗑️ Очистить корзину
                </NButton>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <NButton onClick={this.handleClose}>
                    Продолжить покупки
                  </NButton>
                  <NButton
                    type="primary"
                    size="large"
                    disabled={this.cartStore.cart.items.length === 0 || this.orderStore.loading}
                    loading={this.orderStore.loading}
                    onClick={this.handleCreateOrder}
                  >
                    💳 Оформить заказ
                  </NButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </NModal>
    )
  }
})
