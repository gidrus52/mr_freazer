interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    statusCode?: number
}

interface LoginRequest {
    email: string
    password: string
}

interface AdminUser {
    email: string
    name: string
    role: string
}

interface Category {
    id?: number
    name: string
    description?: string
    slug?: string
}

interface CategoryRequest {
    name: string
    description?: string
}

const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

// Улучшенная функция для проверки валидности токена
const isValidToken = (token: string | null): boolean => {
    if (!token) {
        console.log('❌ Токен отсутствует')
        return false
    }
    
    if (token.length < 10) {
        console.log('❌ Токен слишком короткий:', token.length)
        return false
    }
    
    if (token.includes('test_token') || token.includes('fake')) {
        console.log('❌ Токен содержит тестовые значения')
        return false
    }
    
    console.log('✅ Токен валидный')
    return true
}

// Улучшенная функция для получения токена с детальной диагностикой
const getValidToken = (): string | null => {
    console.log('=== ДИАГНОСТИКА ТОКЕНА ===')
    
    const token = localStorage.getItem('authToken')
    console.log('Токен из localStorage:', token ? `найден (${token.substring(0, 20)}...)` : 'не найден')
    
    if (!isValidToken(token)) {
        console.log('❌ Токен невалидный, возвращаем null')
        return null
    }
    
    console.log('✅ Возвращаем валидный токен')
    return token
}

// Улучшенная функция для проверки аутентификации
const isAuthenticated = (): boolean => {
    console.log('=== ПРОВЕРКА АУТЕНТИФИКАЦИИ ===')
    
    const token = getValidToken()
    const isAdmin = localStorage.getItem('isAdmin')
    const adminUser = localStorage.getItem('adminUser')
    
    console.log('Данные аутентификации:')
    console.log('- Токен валидный:', !!token)
    console.log('- isAdmin:', isAdmin)
    console.log('- adminUser:', adminUser ? 'найден' : 'не найден')
    
    const authenticated = !!token && !!isAdmin
    console.log('Результат аутентификации:', authenticated)
    
    if (!authenticated) {
        console.log('❌ Причины неудачной аутентификации:')
        if (!token) console.log('- Нет валидного токена')
        if (!isAdmin) console.log('- Флаг isAdmin не установлен')
    }
    
    return authenticated
}

const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    console.log('=== API ЗАПРОС ===')
    console.log('URL:', `/api${url}`)
    console.log('Метод:', options.method || 'GET')
    
    const token = getValidToken()
    const existingHeaders = options.headers as Record<string, string> || {}
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...existingHeaders
    }
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('✅ Заголовок Authorization добавлен')
    } else {
        console.log('❌ Заголовок Authorization НЕ добавлен (нет токена)')
    }
    
    console.log('Заголовки запроса:', headers)
    console.log('Тело запроса:', options.body)

    try {
        const response = await fetch(`/api${url}`, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'omit'
        })
        
        console.log('Статус ответа:', response.status)
        console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()))
        
        const responseText = await response.text()
        console.log('Текст ответа:', responseText)
        
        let data: any
        try {
            data = JSON.parse(responseText)
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
        
        console.log('Результат API запроса:', result)
        return result
        
    } catch (error) {
        console.error('❌ Ошибка API запроса:', error)
        return {
            success: false,
            message: `Ошибка сети: ${error}`,
            statusCode: 0
        }
    }
}

export const login = async (credentials: LoginRequest): Promise<ApiResponse> => {
    console.log('=== ВХОД В СИСТЕМУ ===')
    console.log('Данные для входа:', credentials)
    
    const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    })
    
    console.log('Результат входа:', result)
    
    if (result.success && result.data) {
        let token = null
        
        if (typeof result.data === 'string') {
            token = result.data
        } else if (result.data && typeof result.data === 'object') {
            token = (result.data as any).token || 
                   (result.data as any).access_token || 
                   (result.data as any).accessToken ||
                   (result.data as any).jwt ||
                   (result.data as any).authToken
        }
        
        console.log('Найденный токен:', token ? `${token.substring(0, 20)}...` : 'не найден')
        
        if (token && isValidToken(token)) {
            localStorage.setItem('authToken', token)
            localStorage.setItem('isAdmin', 'true')
            localStorage.setItem('adminUser', JSON.stringify({
                email: credentials.email,
                name: 'Администратор',
                role: 'admin'
            }))
            
            console.log('✅ Данные аутентификации сохранены')
            console.log('Проверка сохранения:')
            console.log('- authToken:', localStorage.getItem('authToken') ? 'сохранен' : 'не найден')
            console.log('- isAdmin:', localStorage.getItem('isAdmin'))
            console.log('- adminUser:', localStorage.getItem('adminUser') ? 'сохранен' : 'не найден')
        } else {
            console.error('❌ Токен невалидный или не найден')
            return {
                success: false,
                message: 'Невалидный токен от сервера',
                statusCode: 400
            }
        }
    }
    
    return result
}

export const checkAdminAuth = async (): Promise<ApiResponse<AdminUser>> => {
    console.log('=== ПРОВЕРКА АДМИНСКИХ ПРАВ ===')
    
    if (!isAuthenticated()) {
        console.log('❌ Нет аутентификации для проверки админских прав')
        return {
            success: false,
            message: 'Нет аутентификации',
            statusCode: 401
        }
    }
    
    return await apiRequest<AdminUser>('/auth/verify-admin')
}

export const logout = (): void => {
    console.log('=== ВЫХОД ИЗ СИСТЕМЫ ===')
    localStorage.removeItem('authToken')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminUser')
    console.log('✅ Данные аутентификации очищены')
}

export const testConnection = async (): Promise<ApiResponse> => {
    console.log('=== ТЕСТ ПОДКЛЮЧЕНИЯ ===')
    return await apiRequest('/health', { method: 'GET' })
}

export const getAdminUser = (): AdminUser | null => {
    const userStr = localStorage.getItem('adminUser')
    return userStr ? JSON.parse(userStr) : null
}

// API функции для категорий с улучшенной диагностикой
export const createCategory = async (categoryData: CategoryRequest): Promise<ApiResponse<Category>> => {
    console.log('=== СОЗДАНИЕ КАТЕГОРИИ ===')
    console.log('Данные категории:', categoryData)
    
    if (!isAuthenticated()) {
        console.log('❌ БЛОКИРОВКА: Нет аутентификации для создания категории')
        return {
            success: false,
            message: 'Необходима авторизация для создания категории',
            statusCode: 401
        }
    }
    
    console.log('✅ Аутентификация прошла, отправляем запрос')
    return await apiRequest<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    })
}

export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
    console.log('=== ПОЛУЧЕНИЕ КАТЕГОРИЙ ===')
    return await apiRequest<Category[]>('/categories', { method: 'GET' })
}

export const updateCategory = async (id: number, categoryData: CategoryRequest): Promise<ApiResponse<Category>> => {
    console.log('=== ОБНОВЛЕНИЕ КАТЕГОРИИ ===')
    console.log('ID категории:', id)
    console.log('Данные категории:', categoryData)
    
    if (!isAuthenticated()) {
        console.log('❌ БЛОКИРОВКА: Нет аутентификации для обновления категории')
        return {
            success: false,
            message: 'Необходима авторизация для обновления категории',
            statusCode: 401
        }
    }
    
    console.log('✅ Аутентификация прошла, отправляем запрос')
    return await apiRequest<Category>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
    })
}

export const deleteCategory = async (id: number): Promise<ApiResponse> => {
    console.log('=== УДАЛЕНИЕ КАТЕГОРИИ ===')
    console.log('ID категории:', id)
    
    if (!isAuthenticated()) {
        console.log('❌ БЛОКИРОВКА: Нет аутентификации для удаления категории')
        return {
            success: false,
            message: 'Необходима авторизация для удаления категории',
            statusCode: 401
        }
    }
    
    console.log('✅ Аутентификация прошла, отправляем запрос')
    return await apiRequest(`/categories/${id}`, { method: 'DELETE' })
}

// Экспортируем функцию для диагностики
export const diagnoseAuth = (): void => {
    console.log('=== ДИАГНОСТИКА АУТЕНТИФИКАЦИИ ===')
    isAuthenticated()
} 