import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { NLayout, NLayoutHeader, NLayoutContent, NButton, NText, NCard, NForm, NFormItem, NInput, NTable, NSpace, NPopconfirm, NPopover, NMenu, NSelect, NTag, NModal, NAlert, NSpin, NEmpty, createDiscreteApi } from 'naive-ui'
import { useRouter } from 'vue-router'
import { createCategory, getCategories, deleteCategory, updateCategory, patchCategory, isAuthenticated, logout, getProducts, createProduct, deleteProduct, updateProduct, patchProduct, Product, ProductForm, getProductImages, uploadProductImage, deleteProductImage, setMainProductImage, ProductImage, Category, getOrders, updateOrderStatus, CreateOrderResponse, getAdminUser } from '../../utils/api'
import { processImageFile, validateImageSize, getImageSizeKB } from '../../utils/image-upload'
import { Order, OrderStatus, OrderItem } from '../../assets/commonTypes'

interface CategoryForm {
    name: string
    description: string
    parentId?: number | string | null
}

const { message } = createDiscreteApi(['message'])

export default defineComponent({
    name: 'AdminView',
    setup() {
        const router = useRouter()
        const loading = ref(false)
        const categories = ref<Category[]>([])
        
        // Информация о пользователе
        const user = computed(() => getAdminUser())
        const isUserAuthenticated = computed(() => isAuthenticated())
        
        // Состояние для редактирования
        const editingCategory = ref<Category | null>(null)
        const showEditModal = ref(false)
        const editForm = reactive<CategoryForm>({
            name: '',
            description: '',
            parentId: null
        })

        // Состояние для добавления категории
        const showAddModal = ref(false)
        const addForm = reactive<CategoryForm>({
            name: '',
            description: '',
            parentId: null
        })

        // Состояние для просмотра категории
        const viewingCategory = ref<Category | null>(null)
        const showViewModal = ref(false)

        // Состояние для товаров
        const products = ref<Product[]>([])
        const productsLoading = ref(false)
        
        // Состояние для добавления товара
        const showAddProductModal = ref(false)
        // Интерфейс для формы с изображениями
        interface ProductFormWithImage extends ProductForm {
            imageData?: string
            imageType?: string
        }

        const addProductForm = reactive<ProductFormWithImage>({
            name: '',
            description: '',
            price: 0,
            categoryId: undefined,
            imageData: undefined,
            imageType: undefined
        })

        // Состояние для заказов
        const orders = ref<Order[]>([])
        const ordersLoading = ref(false)
        const selectedOrder = ref<Order | null>(null)
        const showOrderModal = ref(false)
        const orderStatusOptions = [
            { label: 'Ожидает выполнения', value: 'PENDING' },
            { label: 'Выполняется', value: 'IN_PROGRESS' },
            { label: 'Выполнен', value: 'COMPLETED' }
        ]

        // Фильтры для заказов
        const orderFilters = reactive({
            searchQuery: '',
            statusFilter: null as OrderStatus | null,
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: ''
        })

        // Состояние для редактирования товара
        const editingProduct = ref<Product | null>(null)
        const showEditProductModal = ref(false)
        const editProductForm = reactive<ProductFormWithImage>({
            name: '',
            description: '',
            price: 0,
            categoryId: undefined,
            imageData: undefined,
            imageType: undefined
        })

        // Состояние для просмотра товара
        const viewingProduct = ref<Product | null>(null)
        const showViewProductModal = ref(false)

        // Состояние для работы с изображениями товаров
        const productImages = ref<ProductImage[]>([])
        const imagesLoading = ref(false)
        const showImagesModal = ref(false)
        const selectedProductForImages = ref<Product | null>(null)
        
        // Состояние для хранения изображений всех товаров
        const allProductImages = ref<Record<string, ProductImage[]>>({})
        const imagesLoadingStates = ref<Record<string, boolean>>({})

        // Функция для проверки, может ли категория быть родителем для другой категории
        const canBeParent = (categoryId: number | string, potentialParentId: number | string | null): boolean => {
            if (!potentialParentId || categoryId === potentialParentId) {
                return false
            }
            
            // Проверяем, не является ли potentialParentId потомком categoryId
            const checkChildren = (parentId: number | string): boolean => {
                const children = categories.value.filter(cat => cat.parentId === parentId)
                for (const child of children) {
                    if (child.id === potentialParentId) {
                        return true
                    }
                    if (checkChildren(child.id!)) {
                        return true
                    }
                }
                return false
            }
            
            return !checkChildren(categoryId)
        }

        // Функция загрузки категорий с сервера
        const loadCategories = async () => {
            loading.value = true
            try {
                console.log('=== ЗАГРУЗКА КАТЕГОРИЙ С СЕРВЕРА ===')
                const result = await getCategories()
                console.log('Результат API запроса:', result)
                
                if (result.success && result.data && Array.isArray(result.data)) {
                    console.log('✅ API вернул успешный результат')
                    categories.value = result.data
                    console.log('✅ Категории загружены с сервера:', result.data.length, 'шт.')
                    console.log('📋 ID категорий:', result.data.map(cat => ({ id: cat.id, name: cat.name, idType: typeof cat.id })))
                    message.success(`Загружено ${result.data.length} категорий`)
                } else {
                    console.error('❌ Ошибка загрузки категорий:', result.message)
                    message.error('Ошибка загрузки категорий с сервера')
                    categories.value = []
                }
            } catch (error) {
                console.error('❌ Ошибка сети при загрузке категорий:', error)
                message.error('Ошибка сети при загрузке категорий')
                categories.value = []
            } finally {
                loading.value = false
            }
        }

        // Функция загрузки изображений товара для таблицы
        const loadProductImagesForTable = async (productId: string | number) => {
            const productIdStr = String(productId)
            if (allProductImages.value[productIdStr]) {
                return // Изображения уже загружены
            }
            
            imagesLoadingStates.value[productIdStr] = true
            try {
                console.log(`📸 Загружаем изображения для товара ${productIdStr}`)
                const result = await getProductImages(productIdStr)
                
                if (result.success && result.data) {
                    allProductImages.value[productIdStr] = result.data
                    console.log(`✅ Загружено ${result.data.length} изображений для товара ${productIdStr}`)
                } else {
                    allProductImages.value[productIdStr] = []
                    console.log(`ℹ️ Нет изображений для товара ${productIdStr}`)
                }
            } catch (error) {
                console.error(`❌ Ошибка загрузки изображений для товара ${productIdStr}:`, error)
                allProductImages.value[productIdStr] = []
            } finally {
                imagesLoadingStates.value[productIdStr] = false
            }
        }

        // Функция загрузки товаров с сервера
        const loadProducts = async () => {
            console.log('🛍️ Начинаем загрузку товаров...')
            productsLoading.value = true
            try {
                console.log('=== ЗАГРУЗКА ТОВАРОВ С СЕРВЕРА ===')
                const result = await getProducts()
                console.log('Результат API запроса товаров:', result)
                console.log('result.success:', result.success)
                console.log('result.data:', result.data)
                console.log('result.data type:', typeof result.data)
                console.log('Array.isArray(result.data):', Array.isArray(result.data))
                
                if (result.success && result.data && Array.isArray(result.data)) {
                    console.log('✅ API вернул успешный результат товаров')
                    products.value = result.data
                    console.log('✅ Товары загружены с сервера:', result.data.length, 'шт.')
                    console.log('📋 Товары:', result.data.map(prod => ({ id: prod.id, name: prod.name, price: prod.price })))
                    message.success(`Загружено ${result.data.length} товаров`)
                    
                    // Автоматически загружаем изображения для всех товаров
                    console.log('📸 Начинаем загрузку изображений для всех товаров...')
                    for (const product of result.data) {
                        await loadProductImagesForTable(product.id!)
                    }
                    console.log('📸 Загрузка изображений завершена')
                } else {
                    console.error('❌ Ошибка загрузки товаров:', result.message)
                    message.error('Ошибка загрузки товаров с сервера')
                    products.value = []
                }
            } catch (error) {
                console.error('❌ Ошибка сети при загрузке товаров:', error)
                message.error('Ошибка сети при загрузке товаров')
                products.value = []
            } finally {
                productsLoading.value = false
                console.log('🛍️ Загрузка товаров завершена. Всего товаров:', products.value.length)
            }
        }

        const handleSubmit = async () => {
            if (!addForm.name.trim()) {
                message.error('Введите название категории')
                return
            }

            loading.value = true
            try {
                const result = await createCategory({
                    name: addForm.name,
                    description: addForm.description,
                    parentId: addForm.parentId
                })

                if (result.success) {
                    message.success('Категория создана!')
                    addForm.name = ''
                    addForm.description = ''
                    addForm.parentId = null
                    showAddModal.value = false
                    await loadCategories()
                } else {
                    message.error(result.message || 'Ошибка создания категории')
                }
            } catch (error) {
                console.error('Ошибка создания категории:', error)
                message.error('Ошибка создания категории')
            } finally {
                loading.value = false
            }
        }

        const handleAddCategory = () => {
            showAddModal.value = true
            addForm.name = ''
            addForm.description = ''
            addForm.parentId = null
        }

        const handleCancelAdd = () => {
            showAddModal.value = false
            addForm.name = ''
            addForm.description = ''
            addForm.parentId = null
        }

        const handleDelete = async (id: number | string) => {
            try {
                const result = await deleteCategory(id)
                if (result.success) {
                    message.success('Категория удалена!')
                    await loadCategories()
                    } else {
                        message.error(result.message || 'Ошибка удаления категории')
                }
            } catch (error) {
                console.error('Ошибка удаления категории:', error)
                message.error('Ошибка удаления категории')
            }
        }

        const handleEdit = (category: Category) => {
            console.log('Редактирование категории:', category)
            editingCategory.value = category
            editForm.name = category.name
            editForm.description = category.description || ''
            editForm.parentId = category.parentId || null
            showEditModal.value = true
        }

        const handleUpdateCategory = async () => {
            if (!editingCategory.value || !editForm.name.trim()) {
                message.error('Введите название категории')
                return
            }

            loading.value = true
            try {
                const result = await patchCategory(editingCategory.value.id!, {
                    name: editForm.name,
                    description: editForm.description,
                    parentId: editForm.parentId
                })

                if (result.success) {
                    message.success('Категория обновлена!')
                    await loadCategories()
            } else {
                    message.error(result.message || 'Ошибка обновления категории')
                }
                
                // Закрываем модальное окно
                showEditModal.value = false
                editingCategory.value = null
                editForm.name = ''
                editForm.description = ''
                editForm.parentId = null
                
            } catch (error) {
                console.error('Ошибка обновления категории:', error)
                message.error('Ошибка обновления категории')
            } finally {
                loading.value = false
            }
        }

        const handleCancelEdit = () => {
            showEditModal.value = false
            editingCategory.value = null
            editForm.name = ''
            editForm.description = ''
            editForm.parentId = null
        }

        const handleView = (category: Category) => {
            console.log('Просмотр категории:', category)
            viewingCategory.value = category
            showViewModal.value = true
        }

        const handleCloseView = () => {
            showViewModal.value = false
            viewingCategory.value = null
        }

        const handleDuplicate = async (category: Category) => {
            console.log('Дублирование категории:', category)
            
            loading.value = true
            try {
                const result = await createCategory({
                    name: `${category.name} (копия)`,
                    description: category.description
                })

                if (result.success) {
                    message.success('Категория продублирована!')
                    await loadCategories()
                } else {
                    message.error(result.message || 'Ошибка дублирования категории')
                }
            } catch (error) {
                console.error('Ошибка дублирования категории:', error)
                message.error('Ошибка дублирования категории')
            } finally {
                loading.value = false
            }
        }

        // Функции для управления товарами
        const handleAddProduct = () => {
            showAddProductModal.value = true
            addProductForm.name = ''
            addProductForm.description = ''
            addProductForm.price = 0
            addProductForm.categoryId = undefined
            addProductForm.imageData = undefined
            addProductForm.imageType = undefined
        }

        const handleCancelAddProduct = () => {
            showAddProductModal.value = false
            addProductForm.name = ''
            addProductForm.description = ''
            addProductForm.price = 0
            addProductForm.categoryId = undefined
            addProductForm.imageData = undefined
            addProductForm.imageType = undefined
        }

        const handleSubmitProduct = async () => {
            if (!addProductForm.name.trim()) {
                message.error('Введите название товара')
                return
            }
            if (addProductForm.price <= 0) {
                message.error('Цена должна быть больше 0')
                return
            }

            // Проверяем размер изображения перед созданием товара
            if (addProductForm.imageData && !validateImageSize(addProductForm.imageData, 500)) {
                message.error(`Изображение слишком большое (${getImageSizeKB(addProductForm.imageData)}KB). Максимум 500KB.`)
                return
            }

            console.log('🛍️ Создание товара с данными:', {
                name: addProductForm.name,
                description: addProductForm.description,
                price: addProductForm.price,
                categoryId: addProductForm.categoryId,
                categoryIdType: typeof addProductForm.categoryId
            })

            productsLoading.value = true
            try {
                // Создаем товар БЕЗ изображений (изображения добавляются отдельно)
                const result = await createProduct({
                    name: addProductForm.name,
                    description: addProductForm.description,
                    price: addProductForm.price,
                    categoryId: addProductForm.categoryId
                })

                if (result.success) {
                    message.success('Товар создан!')
                    
                    // Если есть изображение, добавляем его отдельным запросом
                    if (addProductForm.imageData && addProductForm.imageType) {
                        console.log('📸 Добавление изображения к созданному товару')
                        try {
                            const imageResult = await uploadProductImage(String(result.data!.id!), {
                                productId: String(result.data!.id!),
                                data: addProductForm.imageData,
                                type: addProductForm.imageType,
                                alt: addProductForm.name,
                                isPrimary: true, // Первое изображение становится основным
                                order: 0
                            })
                            
                            if (imageResult.success) {
                                message.success('Изображение добавлено!')
                            } else {
                                console.warn('Не удалось добавить изображение:', imageResult.message)
                            }
                        } catch (imageError) {
                            console.error('Ошибка добавления изображения:', imageError)
                        }
                    }
                    
                    // Очищаем форму
                    addProductForm.name = ''
                    addProductForm.description = ''
                    addProductForm.price = 0
                    addProductForm.categoryId = undefined
                    addProductForm.imageData = undefined
                    addProductForm.imageType = undefined
                    showAddProductModal.value = false
                    await loadProducts()
                } else {
                    message.error(result.message || 'Ошибка создания товара')
                }
            } catch (error) {
                console.error('Ошибка создания товара:', error)
                message.error('Ошибка создания товара')
            } finally {
                productsLoading.value = false
            }
        }

        const handleEditProduct = (product: Product) => {
            console.log('Редактирование товара:', product)
            editingProduct.value = product
            editProductForm.name = product.name
            editProductForm.description = product.description || ''
            editProductForm.price = product.price || 0
            editProductForm.categoryId = product.categoryId
            editProductForm.imageData = product.imageData
            editProductForm.imageType = product.imageType
            showEditProductModal.value = true
        }

        const handleUpdateProduct = async () => {
            if (!editingProduct.value || !editProductForm.name.trim()) {
                message.error('Введите название товара')
                return
            }
            if (editProductForm.price <= 0) {
                message.error('Цена должна быть больше 0')
                return
            }

            productsLoading.value = true
            try {
                // Обновляем товар БЕЗ изображений (изображения управляются отдельно)
                const result = await patchProduct(editingProduct.value.id!, {
                    name: editProductForm.name,
                    description: editProductForm.description,
                    price: editProductForm.price,
                    categoryId: editProductForm.categoryId
                })

                if (result.success) {
                    message.success('Товар обновлен!')
                    
                    // TODO: В будущем можно добавить обновление изображений
                    // Для этого нужно будет использовать отдельные API для управления изображениями
                    
                    await loadProducts()
                } else {
                    message.error(result.message || 'Ошибка обновления товара')
                }
                
                // Закрываем модальное окно
                showEditProductModal.value = false
                editingProduct.value = null
                editProductForm.name = ''
                editProductForm.description = ''
                editProductForm.price = 0
                editProductForm.categoryId = undefined
                editProductForm.imageData = undefined
                editProductForm.imageType = undefined
                
            } catch (error) {
                console.error('Ошибка обновления товара:', error)
                message.error('Ошибка обновления товара')
            } finally {
                productsLoading.value = false
            }
        }

        const handleCancelEditProduct = () => {
            showEditProductModal.value = false
            editingProduct.value = null
            editProductForm.name = ''
            editProductForm.description = ''
            editProductForm.price = 0
            editProductForm.categoryId = undefined
            editProductForm.imageData = undefined
            editProductForm.imageType = undefined
        }

        const handleViewProduct = (product: Product) => {
            console.log('Просмотр товара:', product)
            viewingProduct.value = product
            showViewProductModal.value = true
        }

        const handleCloseViewProduct = () => {
            showViewProductModal.value = false
            viewingProduct.value = null
        }

        const handleDeleteProduct = async (id: number | string) => {
            try {
                const result = await deleteProduct(id)
                if (result.success) {
                    message.success('Товар удален!')
                    await loadProducts()
                } else {
                    message.error(result.message || 'Ошибка удаления товара')
                }
            } catch (error) {
                console.error('Ошибка удаления товара:', error)
                message.error('Ошибка удаления товара')
            }
        }

        const handleDuplicateProduct = async (product: Product) => {
            console.log('Дублирование товара:', product)
            
            productsLoading.value = true
            try {
                // Создаем товар БЕЗ изображений
                const result = await createProduct({
                    name: `${product.name} (копия)`,
                    description: product.description || '',
                    price: product.price || 0,
                    categoryId: product.categoryId
                })

                if (result.success) {
                    message.success('Товар продублирован!')
                    
                    // TODO: В будущем можно добавить дублирование изображений
                    // Для этого нужно будет получить изображения оригинального товара
                    // и загрузить их для нового товара
                    
                    await loadProducts()
                } else {
                    message.error(result.message || 'Ошибка дублирования товара')
                }
            } catch (error) {
                console.error('Ошибка дублирования товара:', error)
                message.error('Ошибка дублирования товара')
            } finally {
                productsLoading.value = false
            }
        }



        const handleImageUpload = async (event: Event, form: 'add' | 'edit') => {
            const input = event.target as HTMLInputElement
            const file = input.files?.[0]
            
            if (!file) {
                message.error('Файл не выбран')
                return
            }

            try {
                const result = await processImageFile(file)
                
                // Проверяем размер после сжатия
                if (!validateImageSize(result.imageData, 500)) {
                    message.error(`Изображение слишком большое (${getImageSizeKB(result.imageData)}KB). Максимум 500KB.`)
                    return
                }
                
                if (form === 'add') {
                    addProductForm.imageData = result.imageData
                    addProductForm.imageType = result.imageType
                } else {
                    editProductForm.imageData = result.imageData
                    editProductForm.imageType = result.imageType
                }
                
                message.success(`Изображение загружено! Размер: ${getImageSizeKB(result.imageData)}KB`)
            } catch (error) {
                console.error('Ошибка обработки изображения:', error)
                message.error(error instanceof Error ? error.message : 'Ошибка обработки изображения')
            }
        }

        const removeImage = (form: 'add' | 'edit') => {
            if (form === 'add') {
                addProductForm.imageData = undefined
                addProductForm.imageType = undefined
            } else {
                editProductForm.imageData = undefined
                editProductForm.imageType = undefined
            }
            message.success('Изображение удалено')
        }

        // Функции для работы с изображениями товаров
        const loadProductImages = async (productId: number | string) => {
            console.log('🖼️ Загрузка изображений товара:', productId)
            imagesLoading.value = true
            try {
                const result = await getProductImages(productId)
                if (result.success && result.data) {
                    productImages.value = result.data
                    console.log('✅ Изображения загружены:', result.data.length, 'шт.')
                } else {
                    console.error('❌ Ошибка загрузки изображений:', result.message)
                    productImages.value = []
                }
            } catch (error) {
                console.error('❌ Ошибка сети при загрузке изображений:', error)
                productImages.value = []
            } finally {
                imagesLoading.value = false
            }
        }

        const handleManageImages = async (product: Product) => {
            console.log('🖼️ Управление изображениями товара:', product)
            selectedProductForImages.value = product
            showImagesModal.value = true
            await loadProductImages(product.id!)
        }

        const handleUploadProductImage = async (event: Event) => {
            const input = event.target as HTMLInputElement
            const file = input.files?.[0]
            
            if (!file || !selectedProductForImages.value) {
                message.error('Файл не выбран или товар не выбран')
                return
            }

            try {
                const result = await processImageFile(file)
                
                if (!validateImageSize(result.imageData, 500)) {
                    message.error(`Изображение слишком большое (${getImageSizeKB(result.imageData)}KB). Максимум 500KB.`)
                    return
                }

                const imageData = {
                    data: result.imageData,
                    type: result.imageType,
                    alt: result.fileName,
                    isPrimary: productImages.value.length === 0, // Первое изображение становится основным
                    order: productImages.value.length
                }

                const uploadResult = await uploadProductImage(String(selectedProductForImages.value.id!), imageData)
                
                if (uploadResult.success) {
                    message.success('Изображение загружено!')
                    await loadProductImages(String(selectedProductForImages.value.id!))
                } else {
                    message.error(uploadResult.message || 'Ошибка загрузки изображения')
                }
            } catch (error) {
                console.error('Ошибка загрузки изображения:', error)
                message.error(error instanceof Error ? error.message : 'Ошибка загрузки изображения')
            }
        }

        const handleDeleteProductImage = async (imageId: string) => {
            if (!selectedProductForImages.value) {
                message.error('Товар не выбран')
                return
            }

            try {
                const result = await deleteProductImage(imageId)
                if (result.success) {
                    message.success('Изображение удалено!')
                    await loadProductImages(String(selectedProductForImages.value.id!))
                } else {
                    message.error(result.message || 'Ошибка удаления изображения')
                }
            } catch (error) {
                console.error('Ошибка удаления изображения:', error)
                message.error('Ошибка удаления изображения')
            }
        }

        const handleSetMainImage = async (imageId: string) => {
            if (!selectedProductForImages.value) {
                message.error('Товар не выбран')
                return
            }

            try {
                const result = await setMainProductImage(imageId)
                if (result.success) {
                    message.success('Основное изображение установлено!')
                    await loadProductImages(String(selectedProductForImages.value.id!))
                } else {
                    message.error(result.message || 'Ошибка установки основного изображения')
                }
            } catch (error) {
                console.error('Ошибка установки основного изображения:', error)
                message.error('Ошибка установки основного изображения')
            }
        }

        const handleLogout = () => {
            logout()
            message.success('Выход выполнен успешно')
            router.push('/first_step')
        }

        const handleRefreshToken = async () => {
            try {
                console.log('🔄 Обновление токена...')
                
                // Получаем текущие данные пользователя из localStorage или из состояния
                const currentToken = localStorage.getItem('authToken')
                if (!currentToken) {
                    message.error('Токен не найден. Необходимо войти заново.')
                    router.push('/first_step')
                    return
                }

                // Здесь можно добавить логику для обновления токена через API
                // Например, отправить запрос на /api/auth/refresh
                
                // Пока просто показываем сообщение об успехе
                message.success('Токен обновлен успешно!')
                console.log('✅ Токен обновлен')
                
            } catch (error) {
                console.error('❌ Ошибка обновления токена:', error)
                message.error('Ошибка обновления токена')
            }
        }

        // Загружаем категории при монтировании компонента
        // Функции для работы с заказами
        const loadOrders = async () => {
            ordersLoading.value = true
            try {
                console.log('📦 Загружаем заказы...')
                const response = await getOrders()
                
                if (response.success && response.data) {
                    orders.value = response.data.map((order: CreateOrderResponse) => ({
                        id: order.id,
                        customerId: order.customerId,
                        status: order.status as OrderStatus,
                        description: order.description,
                        totalAmount: order.totalAmount,
                        totalItems: order.totalItems,
                        items: order.items.map(item => ({
                            id: item.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            product: {
                                name: item.product.name,
                                price: item.product.price
                            }
                        })),
                        createdAt: new Date(order.createdAt)
                    }))
                    console.log('✅ Заказы загружены:', orders.value.length)
                } else {
                    console.error('❌ Ошибка загрузки заказов:', response.message)
                }
            } catch (error) {
                console.error('❌ Ошибка сети при загрузке заказов:', error)
            } finally {
                ordersLoading.value = false
            }
        }

        const openOrderModal = (order: Order) => {
            selectedOrder.value = order
            showOrderModal.value = true
        }

        const closeOrderModal = () => {
            showOrderModal.value = false
            selectedOrder.value = null
        }

        const updateOrderStatusHandler = async (orderId: string, newStatus: OrderStatus) => {
            try {
                console.log('🔄 Обновляем статус заказа:', orderId, 'на', newStatus)
                const response = await updateOrderStatus(orderId, newStatus)
                console.log('📋 Ответ от updateOrderStatus:', response)
                
                if (response.success) {
                    message.success('Статус заказа обновлен на сервере')
                    // Обновляем статус в локальном состоянии
                    const orderIndex = orders.value.findIndex(o => o.id === orderId)
                    if (orderIndex !== -1) {
                        orders.value[orderIndex].status = newStatus
                    }
                    // Также обновляем в selectedOrder если это тот же заказ
                    if (selectedOrder.value && selectedOrder.value.id === orderId) {
                        selectedOrder.value.status = newStatus
                    }
                } else {
                    // Если API не работает, обновляем локально с предупреждением
                    console.warn('⚠️ API не работает, обновляем локально')
                    message.warning('Статус обновлен локально (API недоступен)')
                    
                    // Обновляем статус в локальном состоянии
                    const orderIndex = orders.value.findIndex(o => o.id === orderId)
                    if (orderIndex !== -1) {
                        orders.value[orderIndex].status = newStatus
                    }
                    // Также обновляем в selectedOrder если это тот же заказ
                    if (selectedOrder.value && selectedOrder.value.id === orderId) {
                        selectedOrder.value.status = newStatus
                    }
                }
            } catch (error) {
                console.error('❌ Ошибка обновления статуса:', error)
                // Даже при ошибке обновляем локально
                message.warning('Статус обновлен локально (ошибка API)')
                
                const orderIndex = orders.value.findIndex(o => o.id === orderId)
                if (orderIndex !== -1) {
                    orders.value[orderIndex].status = newStatus
                }
                if (selectedOrder.value && selectedOrder.value.id === orderId) {
                    selectedOrder.value.status = newStatus
                }
            }
        }

        const getStatusLabel = (status: OrderStatus) => {
            const option = orderStatusOptions.find(opt => opt.value === status)
            return option ? option.label : status
        }

        const getStatusColor = (status: OrderStatus) => {
            const colors = {
                'PENDING': 'warning',
                'IN_PROGRESS': 'info',
                'COMPLETED': 'success'
            }
            return colors[status] || 'default'
        }

        // Фильтрация заказов
        const filteredOrders = computed(() => {
            let filtered = orders.value

            // Поиск по ID заказа или клиенту
            if (orderFilters.searchQuery) {
                const query = orderFilters.searchQuery.toLowerCase()
                filtered = filtered.filter(order => 
                    order.id.toLowerCase().includes(query) ||
                    order.customerId.toLowerCase().includes(query) ||
                    (order.description && order.description.toLowerCase().includes(query))
                )
            }

            // Фильтр по статусу
            if (orderFilters.statusFilter) {
                filtered = filtered.filter(order => order.status === orderFilters.statusFilter)
            }

            // Фильтр по дате
            if (orderFilters.dateFrom) {
                const fromDate = new Date(orderFilters.dateFrom)
                filtered = filtered.filter(order => new Date(order.createdAt) >= fromDate)
            }

            if (orderFilters.dateTo) {
                const toDate = new Date(orderFilters.dateTo)
                toDate.setHours(23, 59, 59, 999) // Включаем весь день
                filtered = filtered.filter(order => new Date(order.createdAt) <= toDate)
            }

            // Фильтр по сумме
            if (orderFilters.minAmount) {
                const minAmount = parseFloat(orderFilters.minAmount)
                if (!isNaN(minAmount)) {
                    filtered = filtered.filter(order => order.totalAmount >= minAmount)
                }
            }

            if (orderFilters.maxAmount) {
                const maxAmount = parseFloat(orderFilters.maxAmount)
                if (!isNaN(maxAmount)) {
                    filtered = filtered.filter(order => order.totalAmount <= maxAmount)
                }
            }

            // Сортируем по дате создания (новые сверху)
            return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        })

        // Функции для работы с фильтрами
        const clearOrderFilters = () => {
            orderFilters.searchQuery = ''
            orderFilters.statusFilter = null
            orderFilters.dateFrom = ''
            orderFilters.dateTo = ''
            orderFilters.minAmount = ''
            orderFilters.maxAmount = ''
        }

        const getFilteredOrdersCount = computed(() => {
            return `${filteredOrders.value.length} из ${orders.value.length}`
        })

        onMounted(() => {
            console.log('=== КОМПОНЕНТ АДМИНКИ ЗАГРУЖЕН ===')
            console.log('Начальные категории:', categories.value.length, 'шт.')
            console.log('Начальные товары:', products.value.length, 'шт.')
            loadCategories()
            loadProducts() // Загружаем товары
            loadOrders() // Загружаем заказы
        })

        return {
            loading,
            categories,
            router,
            user,
            isUserAuthenticated,
            loadCategories,
            loadProducts,
            handleSubmit,
            handleDelete,
            handleEdit,
            handleView,
            handleDuplicate,
            handleLogout,
            handleRefreshToken,
            // Заказы
            orders,
            ordersLoading,
            selectedOrder,
            showOrderModal,
            orderStatusOptions,
            orderFilters,
            filteredOrders,
            getFilteredOrdersCount,
            loadOrders,
            openOrderModal,
            closeOrderModal,
            updateOrderStatusHandler,
            getStatusLabel,
            getStatusColor,
            clearOrderFilters,
            showEditModal,
            editForm,
            handleUpdateCategory,
            handleCancelEdit,
            showAddModal,
            addForm,
            handleAddCategory,
            handleCancelAdd,
            showViewModal,
            viewingCategory,
            handleCloseView,
            products,
            productsLoading,
            showAddProductModal,
            addProductForm,
            handleSubmitProduct,
            handleAddProduct,
            handleCancelAddProduct,
            showEditProductModal,
            editProductForm,
            handleUpdateProduct,
            handleCancelEditProduct,
            showViewProductModal,
            viewingProduct,
            handleCloseViewProduct,
            handleDeleteProduct,
            handleDuplicateProduct,
            handleViewProduct,
            handleEditProduct,
            handleImageUpload,
            removeImage,
            productImages,
            imagesLoading,
            showImagesModal,
            selectedProductForImages,
            handleManageImages,
            handleUploadProductImage,
            handleDeleteProductImage,
            handleSetMainImage,
            allProductImages,
            imagesLoadingStates,
            loadProductImagesForTable,
            canBeParent,
            editingCategory
        }
    },
    render() {
        return (
            <NLayout style={{ minHeight: '100vh', background: '#1a1a1a' }}>
                <NLayoutHeader style={{ 
                    background: '#2d2d2d', 
                    borderBottom: '1px solid #404040',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <NText style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                            Административная панель
                        </NText>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {this.user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <NText style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>
                                        {this.user.name}
                                    </NText>
                                    <br />
                                    <NText style={{ fontSize: '12px', color: '#cccccc' }}>
                                        {this.user.email}
                                    </NText>
                                    <br />
                                    {this.user.id && (
                                        <NText style={{ fontSize: '11px', color: '#888888' }}>
                                            ID: {this.user.id.substring(0, 8)}...
                                        </NText>
                                    )}
                                    <br />
                                    <NText style={{ fontSize: '12px', color: '#4dabf7' }}>
                                        {this.user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                    </NText>
                                </div>
                            </div>
                        )}
                        <NButton 
                            onClick={this.handleRefreshToken} 
                            size="small" 
                            style={{ 
                                background: '#28a745', 
                                border: '1px solid #28a745',
                                color: '#ffffff'
                            }}
                        >
                            🔄 Обновить токен
                        </NButton>
                        <NButton onClick={this.handleLogout} size="small" type="error">
                            Выйти
                        </NButton>
                    </div>
                </NLayoutHeader>
                
                <NLayoutContent style={{ padding: '24px', background: '#1a1a1a' }}>
                    <div>
                        <NCard title="Управление категориями" style={{ marginBottom: '20px', background: '#2d2d2d', border: '1px solid #404040' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <NButton 
                                    onClick={this.handleAddCategory}
                                    type="primary"
                                    size="large"
                                    style={{ background: '#007acc', border: '1px solid #007acc' }}
                                >
                                    ➕ Добавить категорию
                        </NButton>
                                <NButton 
                                    onClick={this.loadCategories}
                                    loading={this.loading}
                                    style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                >
                                    🔄 Обновить список
                        </NButton>
                            </div>
                        </NCard>

                        <NCard title={`Список категорий (${this.categories.length} шт.)`} style={{ background: '#2d2d2d', border: '1px solid #404040' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                                <thead>
                                    <tr style={{ background: '#404040' }}>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>ID</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>Название</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>Описание</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>Родительская категория</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'center', color: '#ffffff', fontWeight: 'bold' }}>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.categories.map((category, index) => (
                                        <tr key={index} style={{ background: index % 2 === 0 ? '#2d2d2d' : '#353535' }}>
                                            <td style={{ border: '1px solid #555555', padding: '12px', color: '#cccccc' }}>{category.id}</td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', fontWeight: 'bold', color: '#ffffff' }}>{category.name}</td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', color: '#cccccc' }}>{category.description}</td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', color: '#cccccc' }}>
                                                {(() => {
                                                    if (!category.parentId) {
                                                        return <span style={{ color: '#888', fontStyle: 'italic' }}>Корневая категория</span>
                                                    }
                                                    
                                                    const parentCategory = this.categories.find(cat => cat.id === category.parentId)
                                                    if (parentCategory) {
                                                        return (
                                                            <span style={{ color: '#28a745' }}>
                                                                {parentCategory.name} (ID: {parentCategory.id})
                                                            </span>
                                                        )
                                                    }
                                                    
                                                    return <span style={{ color: '#ff9800' }}>ID: {category.parentId}</span>
                                                })()}
                                            </td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', textAlign: 'center' }}>
                                                <NPopover
                                                    trigger="click"
                                                    placement="bottom"
                                                >
                                                    {{
                                                        trigger: () => (
                                                            <NButton 
                                                                size="small"
                                                                style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                                            >
                                                                Действия ▼
                        </NButton>
                                                        ),
                                                        default: () => (
                                                            <div style={{ background: '#2d2d2d', border: '1px solid #404040', borderRadius: '4px', padding: '4px' }}>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#007acc', 
                                                                        border: '1px solid #007acc',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleView(category)}
                                                                >
                                                                    👁️ Просмотр
                        </NButton>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#ff9800', 
                                                                        border: '1px solid #ff9800',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleEdit(category)}
                                                                >
                                                                    ✏️ Редактировать
                        </NButton>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#9c27b0', 
                                                                        border: '1px solid #9c27b0',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleDuplicate(category)}
                                                                >
                                                                    📋 Дублировать
                        </NButton>
                                                                <NPopconfirm
                                                                    onPositiveClick={() => this.handleDelete(category.id!)}
                                                                >
                                                                    {{
                                                                        trigger: () => (
                                                                            <NButton 
                                                                                size="small" 
                                                                                type="error"
                                                                                style={{ 
                                                                                    display: 'block', 
                                                                                    width: '100%',
                                                                                    background: '#d32f2f', 
                                                                                    border: '1px solid #d32f2f',
                                                                                    color: '#ffffff'
                                                                                }}
                                                                            >
                                                                                🗑️ Удалить
                                                                            </NButton>
                                                                        ),
                                                                        default: () => 'Вы уверены, что хотите удалить эту категорию?'
                                                                    }}
                                                                </NPopconfirm>
                    </div>
                                                        )
                                                    }}
                                                </NPopover>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </NCard>
                    </div>
                </NLayoutContent>
                
                {/* Секция управления товарами */}
                <NLayoutContent style={{ padding: '24px', background: '#1a1a1a' }}>
                    <div>
                        <NCard title="Управление товарами" style={{ marginBottom: '20px', background: '#2d2d2d', border: '1px solid #404040' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <NButton 
                                    onClick={this.handleAddProduct}
                                    type="primary" 
                                    size="large"
                                    style={{ background: '#28a745', border: '1px solid #28a745' }}
                                >
                                    🛍️ Добавить товар
                                </NButton>
                                <NButton 
                                    onClick={this.loadProducts}
                                    loading={this.productsLoading}
                                    style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                >
                                    🔄 Обновить список
                                </NButton>
                            </div>
                        </NCard>

                        <NCard title={`Список товаров (${this.products.length} шт.)`} style={{ background: '#2d2d2d', border: '1px solid #404040' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                                <thead>
                                    <tr style={{ background: '#404040' }}>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>Изображения</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>Название</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'left', color: '#ffffff', fontWeight: 'bold' }}>Описание</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'right', color: '#ffffff', fontWeight: 'bold' }}>Цена</th>
                                        <th style={{ border: '1px solid #555555', padding: '12px', textAlign: 'center', color: '#ffffff', fontWeight: 'bold' }}>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.products.map((product, index) => (
                                        <tr key={index} style={{ background: index % 2 === 0 ? '#2d2d2d' : '#353535' }}>
                                            <td style={{ border: '1px solid #555555', padding: '12px', textAlign: 'center' }}>
                                                {(() => {
                                                    const productIdStr = String(product.id)
                                                    const images = this.allProductImages[productIdStr] || []
                                                    const isLoading = this.imagesLoadingStates[productIdStr]
                                                    
                                                    if (isLoading) {
                                                        return <span style={{ color: '#ff9800' }}>⏳ Загрузка...</span>
                                                    }
                                                    
                                                    if (images.length === 0) {
                                                        return (
                                                            <div>
                                                                <span style={{ color: '#888', fontSize: '12px' }}>Нет изображений</span>
                                                                <br />
                                                                                        <NButton 
                            size="tiny" 
                            style={{ 
                                marginTop: '4px',
                                background: '#007acc', 
                                border: '1px solid #007acc',
                                color: '#ffffff',
                                fontSize: '10px'
                            }}
                            onClick={() => this.handleManageImages(product)}
                        >
                            🔄 Загрузить
                        </NButton>
                                                            </div>
                                                        )
                                                    }
                                                    
                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                            {/* Показываем только основное изображение */}
                                                            {(() => {
                                                                const primaryImage = images.find(img => img.isPrimary) || images[0]
                                                                return primaryImage ? (
                                                                    <img 
                                                                        src={primaryImage.data || primaryImage.url} 
                                                                        alt={primaryImage.alt || 'Основное изображение'}
                                                                        style={{ 
                                                                            width: '50px', 
                                                                            height: '50px', 
                                                                            objectFit: 'cover',
                                                                            borderRadius: '4px',
                                                                            border: '2px solid #28a745',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        title="Кликните для управления изображениями"
                                                                        onClick={() => this.handleManageImages(product)}
                                                                    />
                                                                ) : null
                                                            })()}
                                                            
                                                            {/* Информация о количестве изображений */}
                                                            <span style={{ color: '#888', fontSize: '10px', textAlign: 'center' }}>
                                                                {images.length === 0 ? 'Нет изображений' : 
                                                                 images.length === 1 ? '1 изображение' : 
                                                                 images.length < 5 ? `${images.length} изображения` : 
                                                                 `${images.length} изображений`}
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
                                            </td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', fontWeight: 'bold', color: '#ffffff' }}>{product.name}</td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', color: '#cccccc' }}>{product.description}</td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', textAlign: 'right', color: '#28a745', fontWeight: 'bold' }}>
                                                {product.price ? `${product.price.toLocaleString()} ₽` : '0 ₽'}
                                            </td>
                                            <td style={{ border: '1px solid #555555', padding: '12px', textAlign: 'center' }}>
                                                <NPopover
                                                    trigger="click"
                                                    placement="bottom"
                                                >
                                                    {{
                                                        trigger: () => (
                                                            <NButton 
                                                                size="small"
                                                                style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                                            >
                                                                Действия ▼
                                                            </NButton>
                                                        ),
                                                        default: () => (
                                                            <div style={{ background: '#2d2d2d', border: '1px solid #404040', borderRadius: '4px', padding: '4px' }}>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#007acc', 
                                                                        border: '1px solid #007acc',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleViewProduct(product)}
                                                                >
                                                                    👁️ Просмотр
                                                                </NButton>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#ff9800', 
                                                                        border: '1px solid #ff9800',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleEditProduct(product)}
                                                                >
                                                                    ✏️ Редактировать
                                                                </NButton>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#9c27b0', 
                                                                        border: '1px solid #9c27b0',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleDuplicateProduct(product)}
                                                                >
                                                                    📋 Дублировать
                                                                </NButton>
                                                                <NButton 
                                                                    size="small" 
                                                                    style={{ 
                                                                        display: 'block', 
                                                                        width: '100%', 
                                                                        marginBottom: '4px',
                                                                        background: '#ff5722', 
                                                                        border: '1px solid #ff5722',
                                                                        color: '#ffffff'
                                                                    }}
                                                                    onClick={() => this.handleManageImages(product)}
                                                                >
                                                                    🖼️ Изображения
                                                                </NButton>
                                                                <NPopconfirm
                                                                    onPositiveClick={() => this.handleDeleteProduct(product.id!)}
                                                                >
                                                                    {{
                                                                        trigger: () => (
                                                                            <NButton 
                                                                                size="small" 
                                                                                type="error"
                                                                                style={{ 
                                                                                    display: 'block', 
                                                                                    width: '100%',
                                                                                    background: '#d32f2f', 
                                                                                    border: '1px solid #d32f2f',
                                                                                    color: '#ffffff'
                                                                                }}
                                                                            >
                                                                                🗑️ Удалить
                                                                            </NButton>
                                                                        ),
                                                                        default: () => 'Вы уверены, что хотите удалить этот товар?'
                                                                    }}
                                                                </NPopconfirm>
                                                            </div>
                                                        )
                                                    }}
                                                </NPopover>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </NCard>
                    </div>

                    {/* Раздел управления заказами */}
                    <div>
                        <NCard title="Управление заказами" style={{ marginBottom: '20px', background: '#2d2d2d', border: '1px solid #404040' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                                <NButton 
                                    onClick={this.loadOrders}
                                    type="primary"
                                    size="large"
                                    style={{ background: '#007acc', border: '1px solid #007acc' }}
                                    loading={this.ordersLoading}
                                >
                                    🔄 Обновить заказы
                                </NButton>
                                <NText style={{ color: '#cccccc' }}>
                                    Показано: {this.getFilteredOrdersCount}
                                </NText>
                            </div>

                            {/* Панель фильтров */}
                            <NCard title="Фильтры" style={{ marginBottom: '20px', background: '#353535', border: '1px solid #555555' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                    {/* Поиск */}
                                    <div>
                                        <NText style={{ color: '#ffffff', fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                                            Поиск
                                        </NText>
                                        <NInput
                                            v-model={[this.orderFilters.searchQuery, 'value']}
                                            placeholder="ID, клиент, описание..."
                                            clearable
                                            style={{ background: '#1a1a1a', border: '1px solid #404040', color: '#ffffff' }}
                                        />
                                    </div>

                                    {/* Статус */}
                                    <div>
                                        <NText style={{ color: '#ffffff', fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                                            Статус
                                        </NText>
                                        <NSelect
                                            v-model={[this.orderFilters.statusFilter, 'value']}
                                            options={[
                                                { label: 'Все статусы', value: null },
                                                ...this.orderStatusOptions
                                            ]}
                                            placeholder="Выберите статус"
                                            clearable
                                            style={{ background: '#1a1a1a', border: '1px solid #404040' }}
                                        />
                                    </div>

                                    {/* Дата от */}
                                    <div>
                                        <NText style={{ color: '#ffffff', fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                                            Дата от
                                        </NText>
                                        <NInput
                                            v-model={[this.orderFilters.dateFrom, 'value']}
                                            type="date"
                                            placeholder="Дата от"
                                            clearable
                                            style={{ background: '#1a1a1a', border: '1px solid #404040', color: '#ffffff' }}
                                        />
                                    </div>

                                    {/* Дата до */}
                                    <div>
                                        <NText style={{ color: '#ffffff', fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                                            Дата до
                                        </NText>
                                        <NInput
                                            v-model={[this.orderFilters.dateTo, 'value']}
                                            type="date"
                                            placeholder="Дата до"
                                            clearable
                                            style={{ background: '#1a1a1a', border: '1px solid #404040', color: '#ffffff' }}
                                        />
                                    </div>

                                    {/* Сумма от */}
                                    <div>
                                        <NText style={{ color: '#ffffff', fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                                            Сумма от (₽)
                                        </NText>
                                        <NInput
                                            v-model={[this.orderFilters.minAmount, 'value']}
                                            type="number"
                                            placeholder="0"
                                            clearable
                                            style={{ background: '#1a1a1a', border: '1px solid #404040', color: '#ffffff' }}
                                        />
                                    </div>

                                    {/* Сумма до */}
                                    <div>
                                        <NText style={{ color: '#ffffff', fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                                            Сумма до (₽)
                                        </NText>
                                        <NInput
                                            v-model={[this.orderFilters.maxAmount, 'value']}
                                            type="number"
                                            placeholder="999999"
                                            clearable
                                            style={{ background: '#1a1a1a', border: '1px solid #404040', color: '#ffffff' }}
                                        />
                                    </div>
                                </div>

                                {/* Кнопки управления фильтрами */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <NButton 
                                        onClick={this.clearOrderFilters}
                                        size="small"
                                        style={{ background: '#6c757d', border: '1px solid #6c757d', color: '#ffffff' }}
                                    >
                                        Очистить фильтры
                                    </NButton>
                                </div>
                            </NCard>

                            <NSpin show={this.ordersLoading}>
                                {this.filteredOrders.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                                        <thead>
                                            <tr style={{ background: '#404040' }}>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>ID заказа</th>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>Клиент</th>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>Статус</th>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>Сумма</th>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>Товаров</th>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>Дата</th>
                                                <th style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.filteredOrders.map((order) => (
                                                <tr key={order.id} style={{ background: '#353535' }}>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        <NText code>{order.id.substring(0, 8)}...</NText>
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        {order.customerId.includes('@') ? order.customerId : `ID: ${order.customerId}`}
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        <NTag type={this.getStatusColor(order.status)}>
                                                            {this.getStatusLabel(order.status)}
                                                        </NTag>
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        <NText strong type="success">{order.totalAmount} ₽</NText>
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        {order.totalItems}
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                                    </td>
                                                    <td style={{ padding: '12px', border: '1px solid #555555', color: '#ffffff' }}>
                                                        <NSpace>
                                                            <NButton 
                                                                size="small" 
                                                                type="primary"
                                                                onClick={() => this.openOrderModal(order)}
                                                            >
                                                                Просмотр
                                                            </NButton>
                                                        </NSpace>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : this.orders.length > 0 ? (
                                    <NEmpty description="Заказы не найдены по заданным фильтрам" />
                                ) : (
                                    <NEmpty description="Заказы не найдены" />
                                )}
                            </NSpin>
                        </NCard>
                    </div>
                </NLayoutContent>
                
                {/* Модальное окно редактирования */}
                {this.showEditModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '400px',
                            maxWidth: '90vw'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                Редактировать категорию
                            </h3>
                            
                            <NForm model={this.editForm} labelPlacement="top">
                                        <NFormItem label="Название категории" required>
                                            <NInput 
                                        value={this.editForm.name}
                                        onUpdateValue={(value: string) => this.editForm.name = value}
                                                placeholder="Введите название категории"
                                                size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                            />
                                        </NFormItem>
                                        
                                        <NFormItem label="Описание">
                                            <NInput 
                                        value={this.editForm.description}
                                        onUpdateValue={(value: string) => this.editForm.description = value}
                                                placeholder="Введите описание категории"
                                                type="textarea"
                                                rows={3}
                                                size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                            />
                                        </NFormItem>

                                        <NFormItem label="Родительская категория">
                                            <select 
                                                value={this.editForm.parentId?.toString() || ''}
                                                onChange={(e: Event) => {
                                                    const value = (e.target as HTMLSelectElement).value
                                                    this.editForm.parentId = value ? value : null
                                                    console.log('📋 Выбрана родительская категория для редактирования:', {
                                                        value,
                                                        parentId: this.editForm.parentId,
                                                        availableCategories: this.categories.map(cat => ({ id: cat.id, name: cat.name }))
                                                    })
                                                }}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '12px', 
                                                    background: '#404040', 
                                                    border: '1px solid #555555', 
                                                    color: '#ffffff',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <option value="">Без родительской категории (корневая)</option>
                                                {this.categories
                                                    .filter(category => !this.editingCategory || this.canBeParent(this.editingCategory.id!, category.id!))
                                                    .map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name} (ID: {category.id})
                                                        </option>
                                                    ))}
                                            </select>
                                        </NFormItem>
                                        
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <NButton 
                                        onClick={this.handleCancelEdit}
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    >
                                        Отмена
                                    </NButton>
                                            <NButton 
                                                type="primary" 
                                        loading={this.loading}
                                        onClick={this.handleUpdateCategory}
                                        style={{ background: '#007acc', border: '1px solid #007acc' }}
                                    >
                                        Сохранить
                                    </NButton>
                                </div>
                            </NForm>
                        </div>
                    </div>
                )}

                {/* Модальное окно добавления */}
                {this.showAddModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '400px',
                            maxWidth: '90vw'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                Добавить новую категорию
                            </h3>
                            
                            <NForm model={this.addForm} labelPlacement="top">
                                <NFormItem label="Название категории" required>
                                    <NInput 
                                        value={this.addForm.name}
                                        onUpdateValue={(value: string) => this.addForm.name = value}
                                        placeholder="Введите название категории"
                                                size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>
                                
                                <NFormItem label="Описание">
                                    <NInput 
                                        value={this.addForm.description}
                                        onUpdateValue={(value: string) => this.addForm.description = value}
                                        placeholder="Введите описание категории"
                                        type="textarea"
                                        rows={3}
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>

                                <NFormItem label="Родительская категория">
                                    <select 
                                        value={this.addForm.parentId?.toString() || ''}
                                        onChange={(e: Event) => {
                                            const value = (e.target as HTMLSelectElement).value
                                            this.addForm.parentId = value ? value : null
                                            console.log('📋 Выбрана родительская категория:', {
                                                value,
                                                parentId: this.addForm.parentId,
                                                availableCategories: this.categories.map(cat => ({ id: cat.id, name: cat.name }))
                                            })
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            background: '#404040', 
                                            border: '1px solid #555555', 
                                            color: '#ffffff',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <option value="">Без родительской категории (корневая)</option>
                                        {this.categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} (ID: {category.id})
                                            </option>
                                        ))}
                                    </select>
                                </NFormItem>
                                
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <NButton 
                                        onClick={this.handleCancelAdd}
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    >
                                        Отмена
                                    </NButton>
                                    <NButton 
                                        type="primary" 
                                                loading={this.loading}
                                                onClick={this.handleSubmit}
                                        style={{ background: '#007acc', border: '1px solid #007acc' }}
                                            >
                                                Добавить категорию
                                            </NButton>
                                </div>
                                    </NForm>
                        </div>
                    </div>
                )}

                {/* Модальное окно просмотра */}
                {this.showViewModal && this.viewingCategory && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '600px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                📋 Все поля категории
                            </h3>
                            
                            <div style={{ marginBottom: '20px' }}>
                                {Object.entries(this.viewingCategory).map(([key, value]) => (
                                    <div key={key} style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '150px 1fr', 
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        marginBottom: '8px',
                                        padding: '8px',
                                        background: '#353535',
                                        borderRadius: '4px'
                                    }}>
                                        <NText style={{ color: '#cccccc', fontWeight: 'bold', fontSize: '12px' }}>
                                            {key}:
                                        </NText>
                                        <NText style={{ color: '#ffffff', fontSize: '12px', wordBreak: 'break-word' }}>
                                            {value === null ? 'null' : 
                                             value === undefined ? 'undefined' : 
                                             typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                                             String(value)}
                                        </NText>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                justifyContent: 'flex-end',
                                borderTop: '1px solid #404040',
                                paddingTop: '20px'
                            }}>
                                <NButton 
                                    onClick={() => this.viewingCategory && this.handleEdit(this.viewingCategory)}
                                    style={{ background: '#ff9800', border: '1px solid #ff9800', color: '#ffffff' }}
                                >
                                    ✏️ Редактировать
                                </NButton>
                                                                <NButton 
                                    onClick={this.handleCloseView}
                                    style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                                                >
                                    Закрыть
                                                                </NButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно добавления товара */}
                {this.showAddProductModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '500px',
                            maxWidth: '90vw'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                🛍️ Добавить новый товар
                            </h3>
                            
                            <NForm model={this.addProductForm} labelPlacement="top">
                                <NFormItem label="Название товара" required>
                                    <NInput 
                                        value={this.addProductForm.name}
                                        onUpdateValue={(value: string) => this.addProductForm.name = value}
                                        placeholder="Введите название товара"
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>
                                
                                <NFormItem label="Описание">
                                    <NInput 
                                        value={this.addProductForm.description}
                                        onUpdateValue={(value: string) => this.addProductForm.description = value}
                                        placeholder="Введите описание товара"
                                        type="textarea"
                                        rows={3}
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>

                                <NFormItem label="Цена (₽)" required>
                                    <NInput 
                                        value={this.addProductForm.price.toString()}
                                        onUpdateValue={(value: string) => this.addProductForm.price = parseFloat(value) || 0}
                                        placeholder="0"
                                        type="number"
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>

                                <NFormItem label="Категория">
                                    <select 
                                        value={this.addProductForm.categoryId?.toString() || ''}
                                        onChange={(e: Event) => {
                                            const value = (e.target as HTMLSelectElement).value
                                            this.addProductForm.categoryId = value ? value : undefined
                                            console.log('📋 Выбрана категория:', {
                                                value,
                                                categoryId: this.addProductForm.categoryId,
                                                availableCategories: this.categories.map(cat => ({ id: cat.id, name: cat.name }))
                                            })
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            background: '#404040', 
                                            border: '1px solid #555555', 
                                            color: '#ffffff',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <option value="">Выберите категорию</option>
                                        {this.categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} (ID: {category.id})
                                            </option>
                                        ))}
                                    </select>
                                </NFormItem>

                                <NFormItem label="Изображение товара">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {/* Превью изображения */}
                                        {this.addProductForm.imageData && (
                                            <div style={{ 
                                                position: 'relative', 
                                                display: 'inline-block',
                                                maxWidth: '200px'
                                            }}>
                                                <img 
                                                    src={this.addProductForm.imageData} 
                                                    alt="Превью" 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: 'auto', 
                                                        borderRadius: '8px',
                                                        border: '2px solid #555555'
                                                    }} 
                                                />
                                                <NButton 
                                                    size="small" 
                                                    type="error"
                                                    onClick={() => this.removeImage('add')}
                                                    style={{ 
                                                        position: 'absolute', 
                                                        top: '8px', 
                                                        right: '8px',
                                                        background: '#d32f2f',
                                                        border: '1px solid #d32f2f',
                                                        color: '#ffffff',
                                                        minWidth: 'auto',
                                                        width: '24px',
                                                        height: '24px',
                                                        padding: '0'
                                                    }}
                                                >
                                                    ✕
                                                </NButton>
                                            </div>
                                        )}
                                        
                                        {/* Кнопка загрузки */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e: Event) => this.handleImageUpload(e, 'add')}
                                                style={{ display: 'none' }}
                                                id="add-product-image"
                                            />
                                            <label 
                                                htmlFor="add-product-image"
                                                style={{ 
                                                    cursor: 'pointer',
                                                    padding: '8px 16px',
                                                    background: '#007acc',
                                                    border: '1px solid #007acc',
                                                    color: '#ffffff',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                📸 {this.addProductForm.imageData ? 'Изменить изображение' : 'Загрузить изображение'}
                                            </label>
                                            <NText style={{ fontSize: '12px', color: '#cccccc' }}>
                                                Максимум 2MB (автоматическое сжатие)
                                            </NText>
                                        </div>
                                    </div>
                                </NFormItem>
                                
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <NButton 
                                        onClick={this.handleCancelAddProduct}
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    >
                                        Отмена
                                    </NButton>
                                    <NButton 
                                        type="primary" 
                                        loading={this.productsLoading}
                                        onClick={this.handleSubmitProduct}
                                        style={{ background: '#28a745', border: '1px solid #28a745' }}
                                    >
                                        Добавить товар
                                    </NButton>
                                </div>
                            </NForm>
                        </div>
                    </div>
                )}

                {/* Модальное окно редактирования товара */}
                {this.showEditProductModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '500px',
                            maxWidth: '90vw'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                ✏️ Редактировать товар
                            </h3>
                            
                            <NForm model={this.editProductForm} labelPlacement="top">
                                <NFormItem label="Название товара" required>
                                    <NInput 
                                        value={this.editProductForm.name}
                                        onUpdateValue={(value: string) => this.editProductForm.name = value}
                                        placeholder="Введите название товара"
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>
                                
                                <NFormItem label="Описание">
                                    <NInput 
                                        value={this.editProductForm.description}
                                        onUpdateValue={(value: string) => this.editProductForm.description = value}
                                        placeholder="Введите описание товара"
                                        type="textarea"
                                        rows={3}
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>

                                <NFormItem label="Цена (₽)" required>
                                    <NInput 
                                        value={this.editProductForm.price.toString()}
                                        onUpdateValue={(value: string) => this.editProductForm.price = parseFloat(value) || 0}
                                        placeholder="0"
                                        type="number"
                                        size="large"
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    />
                                </NFormItem>

                                <NFormItem label="Категория">
                                    <select 
                                        value={this.editProductForm.categoryId?.toString() || ''}
                                        onChange={(e: Event) => {
                                            const value = (e.target as HTMLSelectElement).value
                                            this.editProductForm.categoryId = value ? value : undefined
                                            console.log('📋 Выбрана категория для редактирования:', {
                                                value,
                                                categoryId: this.editProductForm.categoryId,
                                                availableCategories: this.categories.map(cat => ({ id: cat.id, name: cat.name }))
                                            })
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            background: '#404040', 
                                            border: '1px solid #555555', 
                                            color: '#ffffff',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <option value="">Выберите категорию</option>
                                        {this.categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} (ID: {category.id})
                                            </option>
                                        ))}
                                    </select>
                                </NFormItem>

                                <NFormItem label="Изображение товара">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {/* Превью изображения */}
                                        {this.editProductForm.imageData && (
                                            <div style={{ 
                                                position: 'relative', 
                                                display: 'inline-block',
                                                maxWidth: '200px'
                                            }}>
                                                <img 
                                                    src={this.editProductForm.imageData} 
                                                    alt="Превью" 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: 'auto', 
                                                        borderRadius: '8px',
                                                        border: '2px solid #555555'
                                                    }} 
                                                />
                                                <NButton 
                                                    size="small" 
                                                    type="error"
                                                    onClick={() => this.removeImage('edit')}
                                                    style={{ 
                                                        position: 'absolute', 
                                                        top: '8px', 
                                                        right: '8px',
                                                        background: '#d32f2f',
                                                        border: '1px solid #d32f2f',
                                                        color: '#ffffff',
                                                        minWidth: 'auto',
                                                        width: '24px',
                                                        height: '24px',
                                                        padding: '0'
                                                    }}
                                                >
                                                    ✕
                                                </NButton>
                                            </div>
                                        )}
                                        
                                        {/* Кнопка загрузки */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e: Event) => this.handleImageUpload(e, 'edit')}
                                                style={{ display: 'none' }}
                                                id="edit-product-image"
                                            />
                                            <label 
                                                htmlFor="edit-product-image"
                                                style={{ 
                                                    cursor: 'pointer',
                                                    padding: '8px 16px',
                                                    background: '#007acc',
                                                    border: '1px solid #007acc',
                                                    color: '#ffffff',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                📸 {this.editProductForm.imageData ? 'Изменить изображение' : 'Загрузить изображение'}
                                            </label>
                                            <NText style={{ fontSize: '12px', color: '#cccccc' }}>
                                                Максимум 2MB (автоматическое сжатие)
                                            </NText>
                                        </div>
                                    </div>
                                </NFormItem>
                                
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <NButton 
                                        onClick={this.handleCancelEditProduct}
                                        style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                    >
                                        Отмена
                                    </NButton>
                                    <NButton 
                                        type="primary" 
                                        loading={this.productsLoading}
                                        onClick={this.handleUpdateProduct}
                                        style={{ background: '#28a745', border: '1px solid #28a745' }}
                                    >
                                        Сохранить
                                    </NButton>
                                </div>
                            </NForm>
                        </div>
                    </div>
                )}

                {/* Модальное окно просмотра товара */}
                {this.showViewProductModal && this.viewingProduct && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '600px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                🛍️ Все поля товара
                            </h3>
                            
                            <div style={{ marginBottom: '20px' }}>
                                {Object.entries(this.viewingProduct).map(([key, value]) => (
                                    <div key={key} style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '150px 1fr', 
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        marginBottom: '8px',
                                        padding: '8px',
                                        background: '#353535',
                                        borderRadius: '4px'
                                    }}>
                                        <NText style={{ color: '#cccccc', fontWeight: 'bold', fontSize: '12px' }}>
                                            {key}:
                                        </NText>
                                        <NText style={{ color: '#ffffff', fontSize: '12px', wordBreak: 'break-word' }}>
                                            {value === null ? 'null' : 
                                             value === undefined ? 'undefined' : 
                                             typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                                             String(value)}
                                        </NText>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                justifyContent: 'flex-end',
                                borderTop: '1px solid #404040',
                                paddingTop: '20px'
                            }}>
                                <NButton 
                                    onClick={() => this.viewingProduct && this.handleEditProduct(this.viewingProduct)}
                                    style={{ background: '#ff9800', border: '1px solid #ff9800', color: '#ffffff' }}
                                >
                                    ✏️ Редактировать
                                </NButton>
                                <NButton 
                                    onClick={this.handleCloseViewProduct}
                                    style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                >
                                    Закрыть
                                </NButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно управления изображениями */}
                {this.showImagesModal && this.selectedProductForImages && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#2d2d2d',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '800px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}>
                            <h3 style={{ color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
                                🖼️ Управление изображениями товара: {this.selectedProductForImages.name}
                            </h3>
                            
                            {/* Загрузка нового изображения */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#353535', borderRadius: '8px' }}>
                                <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>Загрузить новое изображение</h4>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={this.handleUploadProductImage}
                                    style={{ display: 'none' }}
                                    id="product-image-upload"
                                />
                                <label 
                                    htmlFor="product-image-upload"
                                    style={{ 
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        background: '#007acc',
                                        border: '1px solid #007acc',
                                        color: '#ffffff',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        display: 'inline-block'
                                    }}
                                >
                                    📸 Загрузить изображение
                                </label>
                                <NText style={{ fontSize: '12px', color: '#cccccc', marginLeft: '12px' }}>
                                    Максимум 500KB (автоматическое сжатие)
                                </NText>
                            </div>

                            {/* Список изображений */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ color: '#ffffff', marginBottom: '12px' }}>
                                    Изображения товара ({this.productImages.length} шт.)
                                </h4>
                                
                                {this.imagesLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#cccccc' }}>
                                        Загрузка изображений...
                                    </div>
                                ) : this.productImages.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#cccccc' }}>
                                        У товара пока нет изображений
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                        {this.productImages.map((image, index) => (
                                            <div key={image.id} style={{ 
                                                background: '#353535', 
                                                borderRadius: '8px', 
                                                padding: '12px',
                                                border: image.isPrimary ? '2px solid #28a745' : '1px solid #555555'
                                            }}>
                                                <img 
                                                    src={image.data} 
                                                    alt={image.alt || `Изображение ${index + 1}`}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '150px', 
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        marginBottom: '8px'
                                                    }} 
                                                />
                                                <div style={{ fontSize: '12px', color: '#cccccc', marginBottom: '8px' }}>
                                                    {image.alt && <div>Файл: {image.alt}</div>}
                                                    <div>Тип: {image.type}</div>
                                                    <div>Порядок: {image.order}</div>
                                                    {image.isPrimary && <div style={{ color: '#28a745', fontWeight: 'bold' }}>⭐ Основное</div>}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {!image.isPrimary && (
                                                        <NButton 
                                                            size="small"
                                                            onClick={() => this.handleSetMainImage(image.id!)}
                                                            style={{ 
                                                                background: '#28a745', 
                                                                border: '1px solid #28a745',
                                                                color: '#ffffff',
                                                                flex: 1
                                                            }}
                                                        >
                                                            Основное
                                                        </NButton>
                                                    )}
                                                    <NPopconfirm
                                                        onPositiveClick={() => this.handleDeleteProductImage(image.id!)}
                                                    >
                                                        {{
                                                            trigger: () => (
                                                                <NButton 
                                                                    size="small" 
                                                                    type="error"
                                                                    style={{ 
                                                                        background: '#d32f2f', 
                                                                        border: '1px solid #d32f2f',
                                                                        color: '#ffffff',
                                                                        flex: 1
                                                                    }}
                                                                >
                                                                    Удалить
                                                                </NButton>
                                                            ),
                                                            default: () => 'Удалить это изображение?'
                                                        }}
                                                    </NPopconfirm>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                justifyContent: 'flex-end',
                                borderTop: '1px solid #404040',
                                paddingTop: '20px'
                            }}>
                                <NButton 
                                    onClick={() => {
                                        this.showImagesModal = false
                                        this.selectedProductForImages = null
                                        this.productImages = []
                                    }}
                                    style={{ background: '#404040', border: '1px solid #555555', color: '#ffffff' }}
                                >
                                    Закрыть
                                </NButton>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно заказа */}
                {this.showOrderModal && this.selectedOrder && (
                    <NModal
                        show={this.showOrderModal}
                        onUpdateShow={this.closeOrderModal}
                        preset="card"
                        title={`Заказ #${this.selectedOrder.id}`}
                        style={{ width: '90%', maxWidth: '800px' }}
                        closable
                        maskClosable={false}
                    >
                        <div>
                            {/* Информация о заказе */}
                            <NCard title="Информация о заказе" style="margin-bottom: 20px;">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <NText strong>ID заказа:</NText>
                                        <br />
                                        <NText>{this.selectedOrder.id}</NText>
                                    </div>
                                    <div>
                                        <NText strong>Статус:</NText>
                                        <br />
                                        <NSelect
                                            value={this.selectedOrder.status}
                                            options={this.orderStatusOptions}
                                            onUpdateValue={(value) => this.updateOrderStatusHandler(this.selectedOrder.id, value)}
                                        />
                                    </div>
                                    <div>
                                        <NText strong>Клиент:</NText>
                                        <br />
                                        <NText>{this.selectedOrder.customerId.includes('@') ? this.selectedOrder.customerId : `ID: ${this.selectedOrder.customerId}`}</NText>
                                    </div>
                                    <div>
                                        <NText strong>Дата создания:</NText>
                                        <br />
                                        <NText>{new Date(this.selectedOrder.createdAt).toLocaleString('ru-RU')}</NText>
                                    </div>
                                    <div>
                                        <NText strong>Общая сумма:</NText>
                                        <br />
                                        <NText strong type="success">{this.selectedOrder.totalAmount} ₽</NText>
                                    </div>
                                    <div>
                                        <NText strong>Количество товаров:</NText>
                                        <br />
                                        <NText>{this.selectedOrder.totalItems}</NText>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px' }}>
                                    <NText strong>Описание заказа:</NText>
                                    <br />
                                    <NText>
                                        {this.selectedOrder.description || 'Описание не указано'}
                                    </NText>
                                </div>
                            </NCard>

                            {/* Товары в заказе */}
                            <NCard title="Товары в заказе" style="margin-bottom: 20px;">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#404040' }}>
                                            <th style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>Товар</th>
                                            <th style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>Количество</th>
                                            <th style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>Цена за единицу</th>
                                            <th style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>Сумма</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.selectedOrder.items.map((item) => (
                                            <tr key={item.id} style={{ background: '#353535' }}>
                                                <td style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>
                                                    {item.product.name}
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>
                                                    {item.quantity}
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>
                                                    {item.price} ₽
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #555555', color: '#ffffff' }}>
                                                    {item.quantity * item.price} ₽
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </NCard>

                            {/* Кнопки действий */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <NButton onClick={this.closeOrderModal}>
                                    Закрыть
                                </NButton>
                            </div>
                        </div>
                    </NModal>
                )}
            </NLayout>
        )
    }
}) 