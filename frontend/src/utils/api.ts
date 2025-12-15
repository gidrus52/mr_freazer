export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    statusCode?: number
}

export interface LoginRequest {
    email: string
    password: string
}

export interface AdminUser {
    id?: string
    email: string
    name: string
    role: string
}

export interface Category {
    id?: number | string
    name: string
    description?: string
    slug?: string
    parentId?: number | string | null
    parent?: Category
    children?: Category[]
}

export interface CategoryRequest {
    name: string
    description?: string
    parentId?: number | string | null
}

const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

// Функция для проверки валидности токена
const isValidToken = (token: string | null): boolean => {
    if (!token) return false
    
    // Проверяем, что токен не пустой и имеет минимальную длину
    if (token.length < 10) return false
    
    // Проверяем, что токен не является тестовым
    if (token.includes('test_token') || token.includes('fake')) return false
    
    return true
}

// Удаляем лишний префикс "Bearer " если он присутствует
const normalizeToken = (token: string | null): string | null => {
    if (!token) return null
    return token.replace(/^Bearer\s+/i, '').trim()
}

// Функция для получения токена с проверкой
const getValidToken = (): string | null => {
    const rawToken = localStorage.getItem('authToken')
    const token = normalizeToken(rawToken)
    // Если токен хранился с префиксом Bearer, перезапишем его в нормализованном виде
    if (rawToken && token && rawToken !== token) {
        try {
            localStorage.setItem('authToken', token)
        } catch {}
    }
    
    if (!isValidToken(token)) {
        console.warn('❌ Невалидный токен найден:', token)
        return null
    }
    
    return token
}

const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const token = getValidToken()
    const method = options.method || 'GET'
    
    // Проверяем, не передается ли уже Authorization в options.headers
    const existingHeaders = options.headers as Record<string, string> || {}
    console.log('=== API REQUEST DIAGNOSTICS ===')
    console.log('URL:', `/api${url}`)
    console.log('Метод:', method)
    console.log('Токен в localStorage:', token ? `валидный (${token.substring(0, 20)}...)` : 'не найден или невалидный')
    console.log('Существующие заголовки из options:', existingHeaders)
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...existingHeaders
    }
    
    // Добавляем токен только для не-GET запросов или если это не запрос к категориям
    const isGetCategories = method === 'GET' && url === '/categories'
    
    if (token && !isGetCategories) {
        // Проверяем, не добавлен ли уже заголовок Authorization
        if (headers['Authorization']) {
            console.log('⚠️ ВНИМАНИЕ: Заголовок Authorization уже существует:', headers['Authorization'])
            console.log('Текущий заголовок будет перезаписан')
        }
        const normalized = normalizeToken(token)!
        headers['Authorization'] = `Bearer ${normalized}`
        console.log('✅ Заголовок Authorization добавлен:', `Bearer ${normalized.substring(0, 20)}...`)
    } else if (isGetCategories) {
        console.log('ℹ️ GET запрос к категориям - токен не требуется')
    } else {
        console.log('❌ Токен не найден или невалидный, заголовок Authorization НЕ добавлен')
    }
    
    console.log('Все заголовки запроса:', headers)
    console.log('Тело запроса:', options.body)

    try {
        const response = await fetch(`/api${url}`, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'omit'
        })
        
        console.log('Статус ответа:', response.status)
        console.log('Заголовки ответа:', response.headers)
        
        const responseText = await response.text()
        console.log('Текст ответа:', responseText)
        
        let data: any
        try {
            data = JSON.parse(responseText)
            console.log('Распарсенные данные:', data)
            console.log('Тип data:', typeof data)
            console.log('data.data:', data.data)
            console.log('data.data type:', typeof data.data)
        } catch (e) {
            console.log('❌ Ошибка парсинга JSON:', e)
            data = { message: responseText }
        }
        
        const result: ApiResponse<T> = {
            success: response.ok,
            data: data.data || data,
            message: data.message || (response.ok ? 'Успешно' : 'Ошибка'),
            statusCode: response.status
        }
        
        console.log('Финальный result.data:', result.data)
        console.log('Финальный result.data type:', typeof result.data)
        console.log('Финальный result.data length:', Array.isArray(result.data) ? result.data.length : 'не массив')
        console.log('Результат API запроса:', result)
        return result
    } catch (error) {
        console.error('Ошибка сети:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Ошибка сети',
            statusCode: 0
        }
    }
}

export const register = async (userData: { email: string, password: string, name?: string }): Promise<ApiResponse> => {
    console.log('Регистрация пользователя:', userData)
    
    const result = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            ...userData,
            role: 'user' // По умолчанию новые пользователи имеют роль 'user'
        })
    })
    
    console.log('Результат API регистрации:', result)
    
    return result
}

export const login = async (credentials: LoginRequest): Promise<ApiResponse> => {
    console.log('Попытка входа с данными:', credentials)
    
    const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    })
    
    console.log('Результат API запроса входа:', result)
    
    if (result.success && result.data) {
        // Ищем токен в разных возможных местах
        let token = null
        
        // Проверим разные варианты структуры ответа
        if (typeof result.data === 'string') {
            token = result.data
        } else if (result.data && typeof result.data === 'object') {
            token = (result.data as any).token || 
                   (result.data as any).access_token || 
                   (result.data as any).accessToken ||
                   (result.data as any).jwt ||
                   (result.data as any).authToken
        }
        
        console.log('Найденный токен (сырой):', token ? token.substring(0, 50) + '...' : 'не найден')
        
        if (typeof token === 'string' && token.length > 0) {
            // Проверяем валидность токена перед сохранением
            const normalized = normalizeToken(token)
            if (isValidToken(normalized)) {
                // Определяем роль пользователя из ответа сервера
                let userRole = null
                let userName = 'Пользователь'
                let userId = null
                let isAdmin = false
                
                if (result.data && typeof result.data === 'object') {
                    const data = result.data as any
                    
                    // Извлекаем токен
                    token = data.accessToken || data.token || data.access_token
                    
                    // Извлекаем информацию о пользователе
                    if (data.user) {
                        userId = data.user.id
                        userName = data.user.name || data.user.email || 'Пользователь'
                        
                        // Обрабатываем роли из массива
                        if (data.user.roles && Array.isArray(data.user.roles)) {
                            // Преобразуем роли в нижний регистр и берем первую роль
                            const roles = data.user.roles.map((role: string) => role.toLowerCase())
                            userRole = roles.includes('admin') ? 'admin' : 'user'
                        }
                    }
                    
                    // Fallback для старого формата
                    if (!userRole) {
                        userRole = data.role || data.userRole
                    }
                    if (!userName || userName === 'Пользователь') {
                        userName = data.name || data.userName || data.email || 'Пользователь'
                    }
                    
                    isAdmin = userRole === 'admin'
                }
                
                // Проверяем, что роль была получена от сервера
                if (!userRole) {
                    console.error('❌ Роль пользователя не получена от сервера')
                    return {
                        success: false,
                        message: 'Не удалось определить роль пользователя. Обратитесь к администратору.',
                        statusCode: 400
                    }
                }
                
                // Проверяем валидность роли
                if (!['admin', 'user'].includes(userRole)) {
                    console.error('❌ Неизвестная роль пользователя:', userRole)
                    return {
                        success: false,
                        message: 'Неизвестная роль пользователя. Обратитесь к администратору.',
                        statusCode: 400
                    }
                }
                
                localStorage.setItem('authToken', normalized!)
                localStorage.setItem('isAdmin', isAdmin.toString())
                localStorage.setItem('adminUser', JSON.stringify({
                    id: userId,
                    email: credentials.email,
                    name: userName,
                    role: userRole
                }))
                console.log('✅ Токен сохранен в localStorage:', normalized!.substring(0, 20) + '...')
                console.log('✅ Данные пользователя сохранены:', {
                    id: userId,
                    email: credentials.email,
                    name: userName,
                    role: userRole,
                    isAdmin: isAdmin
                })
                console.log('Проверка сохранения:', {
                    authToken: localStorage.getItem('authToken') ? 'сохранен' : 'не найден',
                    isAdmin: localStorage.getItem('isAdmin'),
                    adminUser: localStorage.getItem('adminUser') ? 'сохранен' : 'не найден'
                })
            } else {
                console.error('❌ Токен невалидный, не сохраняем')
                return {
                    success: false,
                    message: 'Получен невалидный токен от сервера',
                    statusCode: 400
                }
            }
        } else {
            console.error('❌ Токен не найден в ответе сервера')
            console.log('Структура result.data:', result.data)
            console.log('Тип result.data:', typeof result.data)
            return {
                success: false,
                message: 'Токен не найден в ответе сервера',
                statusCode: 400
            }
        }
    } else {
        console.error('❌ Ошибка входа:', result.message, result.statusCode)
    }
    
    return result
}

export const checkAdminAuth = async (): Promise<ApiResponse<AdminUser>> => {
    console.log('Проверка админских прав...')
    const token = getValidToken()
    
    if (!token) {
        console.log('❌ Нет валидного токена для проверки админских прав')
        return {
            success: false,
            message: 'Нет валидного токена авторизации',
            statusCode: 401
        }
    }
    
    return await apiRequest<AdminUser>('/auth/verify-admin')
}

export const logout = (): void => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminUser')
    console.log('✅ Выход выполнен, данные очищены')
}

export const isAuthenticated = (): boolean => {
    const token = getValidToken()
    const isAdmin = localStorage.getItem('isAdmin')
    const adminUser = localStorage.getItem('adminUser')
    
    // Проверяем наличие токена и информации о пользователе
    if (!token || !adminUser) {
        console.log('❌ Аутентификация не пройдена: отсутствует токен или данные пользователя')
        return false
    }
    
    try {
        const userData = JSON.parse(adminUser)
        const hasValidRole = userData.role && ['admin', 'user'].includes(userData.role)
        
        const authenticated = !!token && hasValidRole
        console.log('Проверка аутентификации:', {
            hasValidToken: !!token,
            hasValidRole: hasValidRole,
            userRole: userData.role,
            authenticated
        })
        
        return authenticated
    } catch (error) {
        console.error('❌ Ошибка парсинга данных пользователя:', error)
        return false
    }
}

export const isAdmin = (): boolean => {
    if (!isAuthenticated()) {
        return false
    }
    
    try {
        const adminUser = localStorage.getItem('adminUser')
        if (!adminUser) return false
        
        const userData = JSON.parse(adminUser)
        return userData.role === 'admin'
    } catch (error) {
        console.error('❌ Ошибка проверки роли администратора:', error)
        return false
    }
}

export const testConnection = async (): Promise<ApiResponse> => {
    console.log('Тестирование подключения к серверу...')
    return await apiRequest('/health', {
        method: 'GET'
    })
}

export const getAdminUser = (): AdminUser | null => {
    const userStr = localStorage.getItem('adminUser')
    return userStr ? JSON.parse(userStr) : null
}

// API функции для категорий
export const createCategory = async (categoryData: CategoryRequest): Promise<ApiResponse<Category>> => {
    console.log('Создание категории:', categoryData)
    
    // Проверяем аутентификацию перед запросом
    if (!isAuthenticated()) {
        console.error('❌ Попытка создания категории без аутентификации')
        return {
            success: false,
            message: 'Необходима авторизация для создания категории',
            statusCode: 401
        }
    }
    
    return await apiRequest<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    })
}

export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
    console.log('=== ПОЛУЧЕНИЕ СПИСКА КАТЕГОРИЙ ===')
    console.log('Отправка запроса к /categories...')
    
    // Убираем проверку аутентификации для чтения категорий
    const result = await apiRequest<Category[]>('/categories', {
        method: 'GET'
    })
    
    console.log('Результат getCategories:', result)
    console.log('result.success:', result.success)
    console.log('result.data:', result.data)
    console.log('result.data type:', typeof result.data)
    console.log('result.data length:', result.data ? result.data.length : 'undefined')
    
    return result
}

export const updateCategory = async (id: number | string, categoryData: CategoryRequest): Promise<ApiResponse<Category>> => {
    console.log('Обновление категории:', id, categoryData)
    
    // Проверяем аутентификацию перед запросом
    if (!isAuthenticated()) {
        console.error('❌ Попытка обновления категории без аутентификации')
        return {
            success: false,
            message: 'Необходима авторизация для обновления категории',
            statusCode: 401
        }
    }
    
    return await apiRequest<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
    })
}

export const deleteCategory = async (id: number | string): Promise<ApiResponse<void>> => {
    console.log('Удаление категории:', id)
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    return await apiRequest<void>(`/categories/${id}`, {
        method: 'DELETE'
    })
} 

export const patchCategory = async (id: number | string, categoryData: CategoryRequest): Promise<ApiResponse<Category>> => {
    console.log('PATCH обновление категории:', id, categoryData)
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    return await apiRequest<Category>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(categoryData)
    })
} 

// Интерфейсы для товаров
export interface Product {
    id?: number | string
    name: string
    description?: string
    price?: number
    categoryId?: number | string
    category?: Category
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
    [key: string]: any
}

export interface ProductForm {
    name: string
    description: string
    price: number
    categoryId?: number | string
}

// Интерфейсы для изображений как отдельной сущности (соответствует Prisma схеме)
export interface ProductImage {
    id?: string
    productId: string
    url?: string // URL изображения
    data?: string // Base64 данные изображения
    type?: string // Тип изображения (jpeg, png, etc.)
    alt?: string // Альтернативный текст
    isPrimary?: boolean // Основное изображение товара
    order?: number // Порядок отображения
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface ProductImageForm {
    productId?: string // ID товара (добавляется автоматически)
    data: string // Base64 данные
    type: string // Тип изображения
    alt?: string // Альтернативный текст
    isPrimary?: boolean
    order?: number
}

// Функции для работы с товарами
export const getProducts = async (): Promise<ApiResponse<Product[]>> => {
    console.log('=== ПОЛУЧЕНИЕ СПИСКА ТОВАРОВ ===')
    console.log('Отправка запроса к /products...')
    const result = await apiRequest<Product[]>('/products', {
        method: 'GET'
    })
    console.log('Результат getProducts:', result)
    return result
}

export const createProduct = async (productData: ProductForm): Promise<ApiResponse<Product>> => {
    console.log('Создание товара:', productData)
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    return await apiRequest<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    })
}

export const updateProduct = async (id: number | string, productData: ProductForm): Promise<ApiResponse<Product>> => {
    console.log('Обновление товара:', id, productData)
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    return await apiRequest<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    })
}

export const patchProduct = async (id: number | string, productData: Partial<ProductForm>): Promise<ApiResponse<Product>> => {
    console.log('PATCH обновление товара:', id, productData)
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    return await apiRequest<Product>(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(productData)
    })
}

export const deleteProduct = async (id: number | string): Promise<ApiResponse<void>> => {
    console.log('Удаление товара:', id)
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    return await apiRequest<void>(`/products/${id}`, {
        method: 'DELETE'
    })
} 

// Функции для работы с изображениями (новая структура API)
export const getAllImages = async (): Promise<ApiResponse<ProductImage[]>> => {
    console.log('=== ПОЛУЧЕНИЕ ВСЕХ ИЗОБРАЖЕНИЙ ===')
    
    return await apiRequest<ProductImage[]>('/images', {
        method: 'GET'
    })
}

export const getProductImages = async (productId: number | string): Promise<ApiResponse<ProductImage[]>> => {
    console.log('=== ПОЛУЧЕНИЕ ИЗОБРАЖЕНИЙ ТОВАРА ===')
    console.log('ID товара:', productId)
    
    return await apiRequest<ProductImage[]>(`/images/product/${productId}`, {
        method: 'GET'
    })
}

export const getImageById = async (imageId: string): Promise<ApiResponse<ProductImage>> => {
    console.log('=== ПОЛУЧЕНИЕ ИЗОБРАЖЕНИЯ ПО ID ===')
    console.log('ID изображения:', imageId)
    
    return await apiRequest<ProductImage>(`/images/${imageId}`, {
        method: 'GET'
    })
}

export const uploadProductImage = async (productId: string, imageData: ProductImageForm): Promise<ApiResponse<ProductImage>> => {
    console.log('=== ЗАГРУЗКА ИЗОБРАЖЕНИЯ ТОВАРА ===')
    console.log('ID товара:', productId)
    console.log('Данные изображения:', {
        hasData: !!imageData.data,
        type: imageData.type,
        isPrimary: imageData.isPrimary,
        order: imageData.order
    })
    
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    
    // Добавляем productId в данные изображения
    const imageDataWithProductId = {
        ...imageData,
        productId
    }
    
    return await apiRequest<ProductImage>('/images', {
        method: 'POST',
        body: JSON.stringify(imageDataWithProductId)
    })
}

export const updateProductImage = async (imageId: string, imageData: Partial<ProductImageForm>): Promise<ApiResponse<ProductImage>> => {
    console.log('=== ОБНОВЛЕНИЕ ИЗОБРАЖЕНИЯ ===')
    console.log('ID изображения:', imageId)
    
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    
    return await apiRequest<ProductImage>(`/images/${imageId}`, {
        method: 'PATCH',
        body: JSON.stringify(imageData)
    })
}

export const deleteProductImage = async (imageId: string): Promise<ApiResponse<void>> => {
    console.log('=== УДАЛЕНИЕ ИЗОБРАЖЕНИЯ ===')
    console.log('ID изображения:', imageId)
    
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    
    return await apiRequest<void>(`/images/${imageId}`, {
        method: 'DELETE'
    })
}

export const softDeleteProductImage = async (imageId: string): Promise<ApiResponse<void>> => {
    console.log('=== МЯГКОЕ УДАЛЕНИЕ ИЗОБРАЖЕНИЯ ===')
    console.log('ID изображения:', imageId)
    
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    
    return await apiRequest<void>(`/images/${imageId}/soft`, {
        method: 'DELETE'
    })
}

export const setMainProductImage = async (imageId: string): Promise<ApiResponse<ProductImage>> => {
    console.log('=== УСТАНОВКА ОСНОВНОГО ИЗОБРАЖЕНИЯ ===')
    console.log('ID изображения:', imageId)
    
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Не авторизован',
            statusCode: 401
        }
    }
    
    return await apiRequest<ProductImage>(`/images/${imageId}/primary`, {
        method: 'PATCH'
    })
}

// API функции для работы с подкатегориями
export const getSubcategories = async (parentId: number | string): Promise<ApiResponse<Category[]>> => {
    console.log('=== ПОЛУЧЕНИЕ ПОДКАТЕГОРИЙ ===')
    console.log('ID родительской категории:', parentId)
    
    return await apiRequest<Category[]>(`/categories/${parentId}/subcategories`, {
        method: 'GET'
    })
}

export const createSubcategory = async (parentId: number | string, subcategoryData: CategoryRequest): Promise<ApiResponse<Category>> => {
    console.log('=== СОЗДАНИЕ ПОДКАТЕГОРИИ ===')
    console.log('ID родительской категории:', parentId)
    console.log('Данные подкатегории:', subcategoryData)
    
    if (!isAuthenticated()) {
        return {
            success: false,
            message: 'Необходима авторизация для создания подкатегории',
            statusCode: 401
        }
    }
    
    // Устанавливаем parentId в данные подкатегории
    const subcategoryWithParent = {
        ...subcategoryData,
        parentId
    }
    
    return await apiRequest<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(subcategoryWithParent)
    })
}

export const getCategoriesWithSubcategories = async (): Promise<ApiResponse<Category[]>> => {
    console.log('=== ПОЛУЧЕНИЕ КАТЕГОРИЙ С ПОДКАТЕГОРИЯМИ ===')
    
    return await apiRequest<Category[]>('/categories/with-subcategories', {
        method: 'GET'
    })
}

// API функции для работы с заказами
export interface CreateOrderRequest {
    customerId: string
    description?: string
    items: {
        productId: string | number
        quantity: number
        price: number
    }[]
}

export interface CreateOrderResponse {
    id: string
    customerId: string
    status: string
    description?: string
    totalAmount: number
    totalItems: number
    items: {
        id: string
        productId: string | number
        quantity: number
        price: number
        product: {
            name: string
            price: number
        }
    }[]
    createdAt: string
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> => {
    console.log('=== СОЗДАНИЕ ЗАКАЗА ===')
    console.log('Данные заказа:', orderData)
    
    return await apiRequest<CreateOrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    })
}

export const getOrders = async (): Promise<ApiResponse<CreateOrderResponse[]>> => {
    console.log('=== ПОЛУЧЕНИЕ ЗАКАЗОВ ===')
    
    // Проверяем аутентификацию перед запросом
    if (!isAuthenticated()) {
        console.error('❌ Попытка получения заказов без аутентификации')
        return {
            success: false,
            message: 'Необходима авторизация для просмотра заказов',
            statusCode: 401
        }
    }
    
    return await apiRequest<CreateOrderResponse[]>('/orders', {
        method: 'GET'
    })
}

export const getOrder = async (orderId: string): Promise<ApiResponse<CreateOrderResponse>> => {
    console.log('=== ПОЛУЧЕНИЕ ЗАКАЗА ===')
    console.log('ID заказа:', orderId)
    
    // Проверяем аутентификацию перед запросом
    if (!isAuthenticated()) {
        console.error('❌ Попытка получения заказа без аутентификации')
        return {
            success: false,
            message: 'Необходима авторизация для просмотра заказа',
            statusCode: 401
        }
    }
    
    return await apiRequest<CreateOrderResponse>(`/orders/${orderId}`, {
        method: 'GET'
    })
}

export const updateOrderStatus = async (orderId: string, status: string): Promise<ApiResponse<CreateOrderResponse>> => {
    console.log('=== ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА ===')
    console.log('ID заказа:', orderId)
    console.log('Новый статус:', status)
    
    // Проверяем аутентификацию перед запросом
    if (!isAuthenticated()) {
        console.error('❌ Попытка обновления статуса заказа без аутентификации')
        return {
            success: false,
            message: 'Необходима авторизация для обновления статуса заказа',
            statusCode: 401
        }
    }
    
    // Пробуем разные варианты endpoints и методов
    const attempts = [
        { endpoint: `/orders/${orderId}/status`, method: 'PATCH' },
        { endpoint: `/orders/${orderId}`, method: 'PATCH' },
        { endpoint: `/orders/${orderId}`, method: 'PUT' },
        { endpoint: `/orders/${orderId}/update`, method: 'PATCH' },
        { endpoint: `/orders/${orderId}/update`, method: 'PUT' }
    ]
    
    for (const attempt of attempts) {
        try {
            console.log(`🔄 Пробуем ${attempt.method} ${attempt.endpoint}`)
            const response = await apiRequest<CreateOrderResponse>(attempt.endpoint, {
                method: attempt.method,
                body: JSON.stringify({ status })
            })
            
            if (response.success) {
                console.log(`✅ Успешно обновлен через ${attempt.method} ${attempt.endpoint}`)
                return response
            } else if (response.statusCode !== 404) {
                console.log(`❌ Ошибка ${response.statusCode} через ${attempt.method} ${attempt.endpoint}: ${response.message}`)
                return response
            } else {
                console.log(`⚠️ 404 через ${attempt.method} ${attempt.endpoint}, пробуем следующий`)
            }
        } catch (error) {
            console.log(`❌ Исключение через ${attempt.method} ${attempt.endpoint}:`, error)
        }
    }
    
    // Если все endpoints не сработали, возвращаем ошибку
    return {
        success: false,
        message: 'Не удалось найти рабочий endpoint для обновления статуса заказа',
        statusCode: 404
    }
} 