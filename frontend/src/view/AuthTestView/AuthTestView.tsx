import { defineComponent, ref } from 'vue'
import { NLayout, NLayoutContent, NCard, NButton, NText, NSpace, createDiscreteApi } from 'naive-ui'
import { useRouter } from 'vue-router'

const { message } = createDiscreteApi(['message'])

export default defineComponent({
    name: 'AuthTestView',
    setup() {
        const router = useRouter()
        const testResults = ref<string[]>([])

        const addResult = (text: string) => {
            testResults.value.push(`[${new Date().toLocaleTimeString()}] ${text}`)
        }

        const checkLocalStorage = () => {
            addResult('=== ПРОВЕРКА LOCALSTORAGE ===')
            const authToken = localStorage.getItem('authToken')
            const isAdmin = localStorage.getItem('isAdmin')
            const adminUser = localStorage.getItem('adminUser')
            
            addResult(`authToken: ${authToken ? `найден (${authToken.substring(0, 20)}...)` : 'не найден'}`)
            addResult(`isAdmin: ${isAdmin}`)
            addResult(`adminUser: ${adminUser}`)
            
            if (authToken && isAdmin) {
                message.success('Данные авторизации найдены!')
            } else {
                message.error('Данные авторизации отсутствуют!')
            }
        }

        const testLogin = async () => {
            addResult('=== ТЕСТИРОВАНИЕ ВХОДА ===')
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'newuserAdmin@test.com',
                        password: '123asx'
                    })
                })
                
                addResult(`Статус входа: ${response.status}`)
                
                const responseText = await response.text()
                addResult(`Ответ сервера: ${responseText}`)
                
                if (response.ok) {
                    try {
                        const data = JSON.parse(responseText)
                        addResult(`Распарсенные данные: ${JSON.stringify(data, null, 2)}`)
                        
                        // Ищем токен в ответе
                        const token = data.token || data.access_token || data.jwt || data
                        if (token && typeof token === 'string') {
                            addResult(`Найден токен: ${token.substring(0, 50)}...`)
                            
                            // Сохраняем токен
                            localStorage.setItem('authToken', token)
                            localStorage.setItem('isAdmin', 'true')
                            localStorage.setItem('adminUser', JSON.stringify({
                                email: 'newuserAdmin@test.com',
                                name: 'Администратор',
                                role: 'admin'
                            }))
                            
                            addResult('✅ Токен сохранен в localStorage')
                            message.success('Токен сохранен!')
                        } else {
                            addResult('❌ Токен не найден в ответе')
                            message.error('Токен не найден в ответе')
                        }
                    } catch (e) {
                        addResult(`❌ Ошибка парсинга JSON: ${e}`)
                        message.error('Ошибка парсинга ответа')
                    }
                } else {
                    addResult(`❌ Ошибка входа: ${response.status}`)
                    message.error(`Ошибка входа: ${response.status}`)
                }
            } catch (error) {
                addResult(`❌ Ошибка при входе: ${error}`)
                message.error('Ошибка при входе')
            }
        }

        const testCategoriesAPI = async () => {
            addResult('=== ТЕСТИРОВАНИЕ API КАТЕГОРИЙ ===')
            
            const token = localStorage.getItem('authToken')
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
                addResult('Добавлен заголовок Authorization')
            } else {
                addResult('Заголовок Authorization НЕ добавлен')
            }
            
            try {
                const response = await fetch('/api/categories', {
                    method: 'GET',
                    headers
                })
                
                addResult(`Статус ответа: ${response.status}`)
                
                const responseText = await response.text()
                addResult(`Текст ответа: ${responseText}`)
                
                if (response.status === 401) {
                    addResult('❌ ОШИБКА 401: Неавторизованный доступ')
                    message.error('Ошибка авторизации при доступе к API')
                } else if (response.ok) {
                    addResult('✅ API запрос успешен')
                    message.success('API запрос успешен')
                } else {
                    addResult(`❌ Ошибка API: ${response.status}`)
                    message.error(`Ошибка API: ${response.status}`)
                }
            } catch (error) {
                addResult(`❌ Ошибка сети: ${error}`)
                message.error('Ошибка сети')
            }
        }

        const testCreateCategory = async () => {
            addResult('=== ТЕСТИРОВАНИЕ СОЗДАНИЯ КАТЕГОРИИ ===')
            
            const token = localStorage.getItem('authToken')
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
                addResult('Добавлен заголовок Authorization')
            } else {
                addResult('Заголовок Authorization НЕ добавлен')
            }
            
            try {
                const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name: 'Тестовая категория',
                        description: 'Описание тестовой категории'
                    })
                })
                
                addResult(`Статус ответа: ${response.status}`)
                
                const responseText = await response.text()
                addResult(`Текст ответа: ${responseText}`)
                
                if (response.status === 401) {
                    addResult('❌ ОШИБКА 401: Неавторизованный доступ при создании категории')
                    message.error('Ошибка авторизации при создании категории')
                } else if (response.ok) {
                    addResult('✅ Категория создана успешно')
                    message.success('Категория создана успешно')
                } else {
                    addResult(`❌ Ошибка создания категории: ${response.status}`)
                    message.error(`Ошибка создания категории: ${response.status}`)
                }
            } catch (error) {
                addResult(`❌ Ошибка сети: ${error}`)
                message.error('Ошибка сети')
            }
        }

        const clearAuth = () => {
            localStorage.removeItem('authToken')
            localStorage.removeItem('isAdmin')
            localStorage.removeItem('adminUser')
            addResult('✅ Данные авторизации очищены')
            message.success('Данные авторизации очищены')
        }

        const goToAdmin = () => {
            router.push('/admin')
        }

        const goToLogin = () => {
            router.push('/first_step')
        }

        return {
            testResults,
            checkLocalStorage,
            testLogin,
            testCategoriesAPI,
            testCreateCategory,
            clearAuth,
            goToAdmin,
            goToLogin
        }
    },
    render() {
        return (
            <NLayout style={{ minHeight: '100vh', padding: '20px' }}>
                <NLayoutContent>
                    <NCard title="Диагностика проблем с аутентификацией">
                        <NSpace vertical size="large">
                            <div>
                                <NText style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                                    Тестирование аутентификации
                                </NText>
                                <NSpace>
                                    <NButton onClick={this.checkLocalStorage} type="primary">
                                        Проверить localStorage
                                    </NButton>
                                    <NButton onClick={this.testLogin} type="primary">
                                        Тест входа
                                    </NButton>
                                    <NButton onClick={this.testCategoriesAPI} type="primary">
                                        Тест API категорий
                                    </NButton>
                                    <NButton onClick={this.testCreateCategory} type="primary">
                                        Тест создания категории
                                    </NButton>
                                    <NButton onClick={this.clearAuth} type="error">
                                        Очистить авторизацию
                                    </NButton>
                                </NSpace>
                            </div>
                            
                            <div>
                                <NText style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                                    Навигация
                                </NText>
                                <NSpace>
                                    <NButton onClick={this.goToAdmin} type="primary">
                                        Перейти в админку
                                    </NButton>
                                    <NButton onClick={this.goToLogin} type="default">
                                        Перейти на страницу входа
                                    </NButton>
                                </NSpace>
                            </div>
                            
                            <div>
                                <NText style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                                    Результаты тестирования
                                </NText>
                                <div style={{ 
                                    maxHeight: '400px', 
                                    overflowY: 'auto', 
                                    border: '1px solid #e0e0e0', 
                                    padding: '10px',
                                    backgroundColor: '#f5f5f5',
                                    fontFamily: 'monospace',
                                    fontSize: '12px'
                                }}>
                                    {this.testResults.map((result, index) => (
                                        <div key={index} style={{ marginBottom: '5px' }}>
                                            {result}
                                        </div>
                                    ))}
                                    {this.testResults.length === 0 && (
                                        <div style={{ color: '#999' }}>
                                            Результаты тестирования появятся здесь...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </NSpace>
                    </NCard>
                </NLayoutContent>
            </NLayout>
        )
    }
}) 