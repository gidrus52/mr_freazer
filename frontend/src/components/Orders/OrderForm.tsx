import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { 
    NCard, 
    NForm, 
    NFormItem, 
    NInput, 
    NSelect, 
    NButton, 
    NSpace, 
    NTable, 
    NText, 
    NDivider,
    NAlert,
    NSpin,
    NModal,
    NGrid,
    NGridItem,
    createDiscreteApi
} from 'naive-ui'
import { Order, OrderStatus, OrderItem } from '../../assets/commonTypes'
import { useOrderStore } from '../../stores/orderStore'
import { isAuthenticated, getAdminUser } from '../../utils/api'

const { message } = createDiscreteApi(['message'])

interface OrderFormProps {
    orderId?: string
    show: boolean
    onUpdateShow: (show: boolean) => void
    onOrderUpdated?: (order: Order) => void
}

export default defineComponent({
    name: 'OrderForm',
    props: {
        orderId: {
            type: String,
            default: undefined
        },
        show: {
            type: Boolean,
            required: true
        },
        onUpdateShow: {
            type: Function,
            required: true
        },
        onOrderUpdated: {
            type: Function,
            default: undefined
        }
    },
    setup(props: OrderFormProps) {
        const orderStore = useOrderStore()
        const loading = ref(false)
        const order = ref<Order | null>(null)
        const isEditing = ref(false)
        const canEdit = ref(false)
        const canChangeStatus = ref(false)

        // Форма для редактирования
        const editForm = ref({
            description: '',
            status: 'PENDING' as OrderStatus
        })

        // Статусы заказа с переводами
        const statusOptions = [
            { label: 'Ожидает выполнения', value: 'PENDING' },
            { label: 'Выполняется', value: 'IN_PROGRESS' },
            { label: 'Выполнен', value: 'COMPLETED' }
        ]

        // Проверка прав доступа
        const checkPermissions = () => {
            if (!order.value) return

            const currentUser = getAdminUser()
            const isAdmin = currentUser?.role === 'admin'
            const isOrderOwner = currentUser?.email === order.value.customerId

            // Автор заказа может просматривать и редактировать описание
            canEdit.value = isOrderOwner || isAdmin
            
            // Только администратор может изменять статус
            canChangeStatus.value = isAdmin

            console.log('Права доступа:', {
                isAdmin,
                isOrderOwner,
                canEdit: canEdit.value,
                canChangeStatus: canChangeStatus.value
            })
        }

        // Загрузка заказа
        const loadOrder = async () => {
            if (!props.orderId) return

            loading.value = true
            try {
                // Сначала пытаемся найти заказ в локальном состоянии
                let foundOrder = orderStore.getOrderById(props.orderId)
                
                if (!foundOrder) {
                    // Если не найден локально, загружаем с сервера
                    await orderStore.loadOrdersFromServer()
                    foundOrder = orderStore.getOrderById(props.orderId)
                }

                if (foundOrder) {
                    order.value = foundOrder
                    editForm.value = {
                        description: foundOrder.description || '',
                        status: foundOrder.status
                    }
                    checkPermissions()
                } else {
                    message.error('Заказ не найден')
                }
            } catch (error) {
                console.error('Ошибка загрузки заказа:', error)
                message.error('Ошибка загрузки заказа')
            } finally {
                loading.value = false
            }
        }

        // Сохранение изменений
        const saveChanges = async () => {
            if (!order.value) return

            loading.value = true
            try {
                let success = true

                // Обновляем статус, если он изменился и у пользователя есть права
                if (canChangeStatus.value && editForm.value.status !== order.value.status) {
                    success = await orderStore.updateOrderStatusOnServer(order.value.id, editForm.value.status)
                    if (success) {
                        message.success('Статус заказа обновлен')
                    }
                }

                // Обновляем описание, если оно изменилось и у пользователя есть права
                if (canEdit.value && editForm.value.description !== order.value.description) {
                    // Здесь можно добавить API для обновления описания заказа
                    // Пока просто обновляем локально
                    order.value.description = editForm.value.description
                    message.success('Описание заказа обновлено')
                }

                if (success) {
                    isEditing.value = false
                    if (props.onOrderUpdated) {
                        props.onOrderUpdated(order.value)
                    }
                }
            } catch (error) {
                console.error('Ошибка сохранения заказа:', error)
                message.error('Ошибка сохранения заказа')
            } finally {
                loading.value = false
            }
        }

        // Отмена редактирования
        const cancelEdit = () => {
            if (order.value) {
                editForm.value = {
                    description: order.value.description || '',
                    status: order.value.status
                }
            }
            isEditing.value = false
        }

        // Закрытие модального окна
        const handleClose = () => {
            isEditing.value = false
            props.onUpdateShow(false)
        }

        // Колонки таблицы товаров
        const orderItemColumns = [
            {
                title: 'Товар',
                key: 'productName',
                render: (row: OrderItem) => row.product.name
            },
            {
                title: 'Количество',
                key: 'quantity',
                render: (row: OrderItem) => row.quantity
            },
            {
                title: 'Цена за единицу',
                key: 'price',
                render: (row: OrderItem) => `${row.price} ₽`
            },
            {
                title: 'Сумма',
                key: 'total',
                render: (row: OrderItem) => `${row.quantity * row.price} ₽`
            }
        ]

        // Получение статуса заказа на русском
        const getStatusLabel = (status: OrderStatus) => {
            const option = statusOptions.find(opt => opt.value === status)
            return option ? option.label : status
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

        // Отслеживание изменений orderId
        watch(() => props.orderId, (newOrderId) => {
            if (newOrderId && props.show) {
                loadOrder()
            }
        })

        // Отслеживание изменений show
        watch(() => props.show, (newShow) => {
            if (newShow && props.orderId) {
                loadOrder()
            }
        })

        return {
            loading,
            order,
            isEditing,
            canEdit,
            canChangeStatus,
            editForm,
            statusOptions,
            orderItemColumns,
            loadOrder,
            saveChanges,
            cancelEdit,
            handleClose,
            getStatusLabel,
            getStatusColor
        }
    },
    render() {
        return (
            <NModal
                show={this.show}
                onUpdateShow={this.handleClose}
                preset="card"
                title={this.order ? `Заказ #${this.order.id}` : 'Заказ'}
                style={{ width: '90%', maxWidth: '800px' }}
                closable
                maskClosable={false}
            >
                <NSpin show={this.loading}>
                    {this.order ? (
                        <div>
                            {/* Информация о заказе */}
                            <NCard title="Информация о заказе" style="margin-bottom: 20px;">
                                <NGrid cols={2} xGap={12} yGap={12}>
                                    <NGridItem>
                                        <NText strong>ID заказа:</NText>
                                        <br />
                                        <NText>{this.order.id}</NText>
                                    </NGridItem>
                                    <NGridItem>
                                        <NText strong>Статус:</NText>
                                        <br />
                                        <NText type={this.getStatusColor(this.order.status)}>
                                            {this.getStatusLabel(this.order.status)}
                                        </NText>
                                    </NGridItem>
                                    <NGridItem>
                                        <NText strong>Клиент:</NText>
                                        <br />
                                        <NText>{this.order.customerId}</NText>
                                    </NGridItem>
                                    <NGridItem>
                                        <NText strong>Дата создания:</NText>
                                        <br />
                                        <NText>{new Date(this.order.createdAt).toLocaleString('ru-RU')}</NText>
                                    </NGridItem>
                                    <NGridItem>
                                        <NText strong>Общая сумма:</NText>
                                        <br />
                                        <NText strong type="success">{this.order.totalAmount} ₽</NText>
                                    </NGridItem>
                                    <NGridItem>
                                        <NText strong>Количество товаров:</NText>
                                        <br />
                                        <NText>{this.order.totalItems}</NText>
                                    </NGridItem>
                                </NGrid>

                                <NDivider />

                                {/* Описание заказа */}
                                <NFormItem label="Описание заказа">
                                    {this.isEditing && this.canEdit ? (
                                        <NInput
                                            v-model={[this.editForm.description, 'value']}
                                            type="textarea"
                                            placeholder="Описание заказа"
                                            rows={3}
                                        />
                                    ) : (
                                        <NText>
                                            {this.order.description || 'Описание не указано'}
                                        </NText>
                                    )}
                                </NFormItem>

                                {/* Статус заказа */}
                                {this.canChangeStatus && (
                                    <NFormItem label="Статус заказа">
                                        {this.isEditing ? (
                                            <NSelect
                                                v-model={[this.editForm.status, 'value']}
                                                options={this.statusOptions}
                                                placeholder="Выберите статус"
                                            />
                                        ) : (
                                            <NText type={this.getStatusColor(this.order.status)}>
                                                {this.getStatusLabel(this.order.status)}
                                            </NText>
                                        )}
                                    </NFormItem>
                                )}
                            </NCard>

                            {/* Товары в заказе */}
                            <NCard title="Товары в заказе" style="margin-bottom: 20px;">
                                <NTable
                                    data={this.order.items}
                                    columns={this.orderItemColumns}
                                    size="small"
                                />
                            </NCard>

                            {/* Кнопки действий */}
                            <NSpace justify="end">
                                {this.isEditing ? (
                                    <>
                                        <NButton onClick={this.cancelEdit}>
                                            Отмена
                                        </NButton>
                                        <NButton 
                                            type="primary" 
                                            onClick={this.saveChanges}
                                            loading={this.loading}
                                        >
                                            Сохранить
                                        </NButton>
                                    </>
                                ) : (
                                    <>
                                        <NButton onClick={this.handleClose}>
                                            Закрыть
                                        </NButton>
                                        {(this.canEdit || this.canChangeStatus) && (
                                            <NButton 
                                                type="primary" 
                                                onClick={() => this.isEditing = true}
                                            >
                                                Редактировать
                                            </NButton>
                                        )}
                                    </>
                                )}
                            </NSpace>
                        </div>
                    ) : (
                        <NAlert type="error" title="Ошибка">
                            Заказ не найден или произошла ошибка при загрузке
                        </NAlert>
                    )}
                </NSpin>
            </NModal>
        )
    }
})
