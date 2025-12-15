import { defineComponent, computed } from 'vue'
import { NButton, NBadge } from 'naive-ui'
import { useCartStore } from '../../stores/cartStore'

export default defineComponent({
  name: 'CartIcon',
  props: {
    onClick: {
      type: Function,
      required: true
    }
  },
  setup() {
    const cartStore = useCartStore()

    const itemCount = computed(() => {
      const count = cartStore.cart.totalItems
      console.log('🛒 CartIcon: обновление счетчика корзины:', count)
      return count
    })

    return {
      itemCount
    }
  },
  render() {
    return (
      <NBadge
        value={this.itemCount}
        showZero={false}
        max={99}
        style={{ marginRight: '8px' }}
      >
        <NButton
          type="primary"
          size="small"
          onClick={this.onClick}
          style={{
            minWidth: '40px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🛒
        </NButton>
      </NBadge>
    )
  }
})
