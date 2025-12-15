import { defineComponent } from 'vue'
import { NButton, NCard, NInputNumber } from 'naive-ui'
import { useCartStore } from '../../stores/cartStore'

export default defineComponent({
  name: 'CartTest',
  setup() {
    const cartStore = useCartStore()

    // Тестовый товар
    const testProduct = {
      id: 1,
      name: "Тестовый товар",
      description: "Описание тестового товара",
      price: 1000,
      categoryId: 1
    }

    const handleAddToCart = () => {
      cartStore.addItem(testProduct, 1)
      console.log('Товар добавлен в корзину:', testProduct)
    }

    const handleClearCart = () => {
      cartStore.clearCart()
      console.log('Корзина очищена')
    }

    return {
      cartStore,
      testProduct,
      handleAddToCart,
      handleClearCart
    }
  },
  render() {
    return (
      <NCard title="🧪 Тест корзины" style={{ margin: '20px', maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>Товар:</strong> {this.testProduct.name}<br/>
          <strong>Цена:</strong> {this.testProduct.price} ₽
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <NButton type="primary" onClick={this.handleAddToCart}>
            🛒 Добавить в корзину
          </NButton>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <NButton type="error" onClick={this.handleClearCart}>
            🗑️ Очистить корзину
          </NButton>
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>Состояние корзины:</strong><br/>
          Товаров: {this.cartStore.cart.totalItems}<br/>
          Стоимость: {this.cartStore.cart.totalPrice.toLocaleString('ru-RU')} ₽<br/>
          Элементов: {this.cartStore.cart.items.length}
        </div>

        {this.cartStore.cart.items.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <strong>Товары в корзине:</strong>
            {this.cartStore.cart.items.map((item, index) => (
              <div key={item.id} style={{ 
                padding: '5px', 
                backgroundColor: '#e9ecef', 
                margin: '5px 0',
                borderRadius: '3px'
              }}>
                {index + 1}. {item.product.name} (x{item.quantity})
              </div>
            ))}
          </div>
        )}
      </NCard>
    )
  }
})
