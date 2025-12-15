import { defineComponent, ref, computed, onMounted } from 'vue'
import { 
    NCard, 
    NTable, 
    NButton, 
    NSpace, 
    NText, 
    NTag,
    NInput,
    NSelect,
    NGrid,
    NGridItem,
    NEmpty,
    NSpin,
    NAlert,
    createDiscreteApi
} from 'naive-ui'
import { Order, OrderStatus } from '../../assets/commonTypes'
import { useOrderStore } from '../../stores/orderStore'
import { isAuthenticated, getAdminUser } from '../../utils/api'
import OrderForm from './OrderForm'

const { message } = createDiscreteApi(['message'])

interface OrderListProps {
    showUserOrdersOnly?: boolean
}

export default defineComponent({
    name: 'OrderList',
    props: {
        showUserOrdersOnly: {
            type: Boolean,
            default: false
        }
    },
    setup(props: OrderListProps) {
        const orderStore = useOrderStore()
        const loading = ref(false)
        const selectedOrder = ref<Order | null>(null)
        const showOrderForm = ref(false)
        const searchQuery = ref('')
        const statusFilter = ref<OrderStatus | null>(null)

        // Получение текущего пользователя
        const currentUser = computed(() => getAdminUser())
        const isAdmin = computed(() => currentUser.value?.role === 'admin')

        // Фильтрация заказов
        const filteredOrders = computed(() => {
            let orders = orderStore.orders

            // Если показываем только заказы пользователя
            if (props.showUserOrdersOnly && currentUser.value) {
                orders = orders.filter(order => order.customerId === currentUser.value?.email)
            }

            // Фильтр по статусу
            if (statusFilter.value) {
                orders = orders.filter(order => order.status === statusFilter.value)
            }

            // Поиск по ID заказа или описанию
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase()
                orders = orders.filter(order => 
                    order.id.toLowerCase().includes(query) ||
                    (order.description && order.description.toLowerCase().includes(query))
                )
            }

            return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        })

        // Загрузка заказов
        const loadOrders = async () => {
            loading.value = true
            try {
                console.log('🔄 Начинаем загрузку заказов...')
                await orderStore.loadOrdersFromServer()
                console.log('✅ Заказы загружены:', orderStore.orders.length)
                
                if (orderStore.orders.length === 0) {
                    message.info('Заказы не найдены')
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки заказов:', error)
                message.error(`Ошибка загрузки заказов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
            } finally {
                loading.value = false
            }
        }

        // Открытие формы заказа
        const openOrderForm = (order: Order) => {
            selectedOrder.value = order
            showOrderForm.value = true
        }

        // Закрытие формы заказа
        const closeOrderForm = () => {
            showOrderForm.value = false
            selectedOrder.value = null
        }

        // Обработка обновления заказа
        const handleOrderUpdated = (updatedOrder: Order) => {
            // Заказ уже обновлен в store, просто закрываем форму
            closeOrderForm()
        }

        // Получение статуса заказа на русском
        const getStatusLabel = (status: OrderStatus) => {
            const statusMap = {
                'PENDING': 'Ожидает выполнения',
                'IN_PROGRESS': 'Выполняется',
                'COMPLETED': 'Выполнен'
            }
            return statusMap[status] || status
        }

        // Получение цвета статуса
        const getStatusColor = (status: OrderStatus) => {
            const colors = {
                'PENDING': 'warning',
                'IN_PROGRESS': 'info',
                'COMPLETED': 'success'
            }
            return colors[status] || 'default'
        }

        // Опции для фильтра статуса
        const statusOptions = [
            { label: 'Все статусы', value: null },
            { label: 'Ожидает выполнения', value: 'PENDING' },
            { label: 'Выполняется', value: 'IN_PROGRESS' },
            { label: 'Выполнен', value: 'COMPLETED' }
        ]

        // Колонки таблицы
        const columns = [
            {
                title: 'ID заказа',
                key: 'id',
                width: 120,
                render: (row: Order) => (
                    <NText code>{row.id.substring(0, 8)}...</NText>
                )
            },
            {
                title: 'Статус',
                key: 'status',
                width: 150,
                render: (row: Order) => (
                    <NTag type={this.getStatusColor(row.status)}>
                        {this.getStatusLabel(row.status)}
                    </NTag>
                )
            },
            {
                title: 'Клиент',
                key: 'customerId',
                width: 150,
                render: (row: Order) => (
                    <NText>{row.customerId}</NText>
                )
            },
            {
                title: 'Сумма',
                key: 'totalAmount',
                width: 100,
                render: (row: Order) => (
                    <NText strong type="success">{row.totalAmount} ₽</NText>
                )
            },
            {
                title: 'Товаров',
                key: 'totalItems',
                width: 80,
                render: (row: Order) => (
                    <NText>{row.totalItems}</NText>
                )
            },
            {
                title: 'Дата создания',
                key: 'createdAt',
                width: 150,
                render: (row: Order) => (
                    <NText>{new Date(row.createdAt).toLocaleDateString('ru-RU')}</NText>
                )
            },
            {
                title: 'Действия',
                key: 'actions',
                width: 100,
                render: (row: Order) => (
                    <NButton 
                        size="small" 
                        type="primary"
                        onClick={() => this.openOrderForm(row)}
                    >
                        Просмотр
                    </NButton>
                )
            }
        ]

        // Загрузка при монтировании
        onMounted(() => {
            if (isAuthenticated()) {
                loadOrders()
            }
        })

        return {
            loading,
            filteredOrders,
            selectedOrder,
            showOrderForm,
            searchQuery,
            statusFilter,
            statusOptions,
            columns,
            loadOrders,
            openOrderForm,
            closeOrderForm,
            handleOrderUpdated,
            getStatusLabel,
            getStatusColor
        }
    },
    render() {
        if (!isAuthenticated()) {
            return (
                <NCard>
                    <NText>Для просмотра заказов необходимо войти в систему</NText>
                </NCard>
            )
        }

        return (
            <div>
                {/* Фильтры и поиск */}
                <NCard style="margin-bottom: 20px;">
                    <NGrid cols={3} xGap={12} yGap={12}>
                        <NGridItem>
                            <NInput
                                v-model={[this.searchQuery, 'value']}
                                placeholder="Поиск по ID или описанию"
                                clearable
                            />
                        </NGridItem>
                        <NGridItem>
                            <NSelect
                                v-model={[this.statusFilter, 'value']}
                                options={this.statusOptions}
                                placeholder="Фильтр по статусу"
                                clearable
                            />
                        </NGridItem>
                        <NGridItem>
                            <NButton 
                                type="primary" 
                                onClick={this.loadOrders}
                                loading={this.loading}
                            >
                                Обновить
                            </NButton>
                        </NGridItem>
                    </NGrid>
                </NCard>

                {/* Список заказов */}
                <NCard title={this.showUserOrdersOnly ? "Мои заказы" : "Все заказы"}>
                    <NSpin show={this.loading}>
                        {orderStore.error ? (
                            <NAlert type="error" title="Ошибка загрузки заказов">
                                {orderStore.error}
                            </NAlert>
                        ) : this.filteredOrders.length > 0 ? (
                            <NTable
                                data={this.filteredOrders}
                                columns={this.columns}
                                size="small"
                                striped
                            />
                        ) : (
                            <NEmpty description="Заказы не найдены" />
                        )}
                    </NSpin>
                </NCard>

                {/* Форма заказа */}
                <OrderForm
                    orderId={this.selectedOrder?.id}
                    show={this.showOrderForm}
                    onUpdateShow={this.closeOrderForm}
                    onOrderUpdated={this.handleOrderUpdated}
                />
            </div>
        )
    }
})
