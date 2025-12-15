import {defineComponent, ref, reactive} from 'vue'
import {NForm, NFormItem, NInput, NButton, NCard, NText, NLayout, NLayoutContent, NTabs, NTabPane, createDiscreteApi} from 'naive-ui'
import {useRouter} from 'vue-router'
import {login, register, testConnection} from '../../utils/api'
import {UserLogin} from '../../assets/commonTypes/user'
import { useTranslation } from '../../utils/translations'

const {message} = createDiscreteApi(['message'])

export default defineComponent({
    name: 'LoginView',
    setup() {
        const router = useRouter()
        const { t } = useTranslation()
        const loading = ref(false)
        const registerLoading = ref(false)
        const testingConnection = ref(false)
        
        const loginFormValue = reactive<UserLogin>({
            name: '',
            password: ''
        })

        const registerFormValue = reactive({
            email: '',
            password: '',
            confirmPassword: '',
            name: ''
        })

        const handleLogin = async () => {
            if (!loginFormValue.name || !loginFormValue.password) {
                message.error('Пожалуйста, заполните все поля')
                return
            }

            loading.value = true
            try {
                const result = await login({
                    email: loginFormValue.name,
                    password: loginFormValue.password
                })
                
                if (result.success) {
                    message.success('Вход выполнен успешно!')
                    router.push('/')
                } else {
                    // Показываем более детальную информацию об ошибке
                    if (result.statusCode === 400 && result.message?.includes('роль')) {
                        message.error('Ошибка авторизации: ' + result.message)
                    } else if (result.statusCode === 401) {
                        message.error('Неверный email или пароль')
                    } else if (result.statusCode === 403) {
                        message.error('Доступ запрещен. Обратитесь к администратору')
                    } else {
                        message.error(result.message || 'Ошибка входа в систему')
                    }
                }
            } catch (error) {
                console.error('Ошибка входа:', error)
                message.error('Ошибка входа в систему')
            } finally {
                loading.value = false
            }
        }

        const handleRegister = async () => {
            if (!registerFormValue.email || !registerFormValue.password || !registerFormValue.name) {
                message.error('Пожалуйста, заполните все обязательные поля')
                return
            }

            if (registerFormValue.password !== registerFormValue.confirmPassword) {
                message.error('Пароли не совпадают')
                return
            }

            if (registerFormValue.password.length < 6) {
                message.error('Пароль должен содержать минимум 6 символов')
                return
            }

            registerLoading.value = true
            try {
                const result = await register({
                    email: registerFormValue.email,
                    password: registerFormValue.password,
                    name: registerFormValue.name
                })
                
                if (result.success) {
                    message.success('Регистрация успешна! Выполняется вход в систему...')
                    
                    // Сразу входим в систему с новыми данными
                    try {
                        const loginResult = await login({
                            email: registerFormValue.email,
                            password: registerFormValue.password
                        })
                        
                        if (loginResult.success) {
                            message.success('Добро пожаловать! Вы успешно зарегистрированы и вошли в систему')
                            router.push('/')
                        } else {
                            message.warning('Регистрация прошла успешно, но автоматический вход не удался. Пожалуйста, войдите вручную')
                        }
                    } catch (loginError) {
                        console.error('Ошибка автоматического входа:', loginError)
                        message.warning('Регистрация прошла успешно, но автоматический вход не удался. Пожалуйста, войдите вручную')
                    }
                    
                    // Очищаем форму регистрации
                    registerFormValue.email = ''
                    registerFormValue.password = ''
                    registerFormValue.confirmPassword = ''
                    registerFormValue.name = ''
                } else {
                    message.error(result.message || 'Ошибка регистрации')
                }
            } catch (error) {
                console.error('Ошибка регистрации:', error)
                message.error('Ошибка регистрации')
            } finally {
                registerLoading.value = false
            }
        }

        const handleTestConnection = async () => {
            testingConnection.value = true
            try {
                const result = await testConnection()
                if (result.success) {
                    message.success('Подключение к серверу успешно!')
                } else {
                    message.error(result.message || 'Ошибка подключения к серверу')
                }
            } catch (error) {
                console.error('Ошибка тестирования:', error)
                message.error('Ошибка тестирования подключения')
            } finally {
                testingConnection.value = false
            }
        }

        return {
            loginFormValue,
            registerFormValue,
            loading,
            registerLoading,
            testingConnection,
            handleLogin,
            handleRegister,
            handleTestConnection,
            t
        }
    },
    render() {
        return (
            <NLayout style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'}}>
                <NLayoutContent style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                    <NCard style={{width: '450px', maxWidth: '90vw'}}>
                        <div style={{textAlign: 'center', marginBottom: '30px'}}>
                            <NText style={{fontSize: '24px', fontWeight: 'bold'}}>
                                {this.t('login.welcome')}
                            </NText>
                        </div>
                        
                        <NTabs type="line" animated>
                            <NTabPane name="login" tab={this.t('login.tabLogin')}>
                                <NForm model={this.loginFormValue} labelPlacement="top">
                                    <NFormItem label={this.t('login.email')} path="name">
                                        <NInput 
                                            value={this.loginFormValue.name}
                                            onUpdateValue={(value: string) => this.loginFormValue.name = value}
                                            placeholder={this.t('login.emailPlaceholder')}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label={this.t('login.password')} path="password">
                                        <NInput 
                                            value={this.loginFormValue.password}
                                            onUpdateValue={(value: string) => this.loginFormValue.password = value}
                                            type="password"
                                            placeholder={this.t('login.passwordPlaceholder')}
                                            size="large"
                                            onKeypress={(e: KeyboardEvent) => {
                                                if (e.key === 'Enter') {
                                                    this.handleLogin()
                                                }
                                            }}
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem>
                                        <NButton 
                                            type="primary" 
                                            size="large" 
                                            style={{width: '100%', marginBottom: '10px'}}
                                            loading={this.loading}
                                            onClick={this.handleLogin}
                                        >
                                            {this.t('login.loginButton')}
                                        </NButton>
                                        
                                        <NButton 
                                            type="default" 
                                            size="large" 
                                            style={{width: '100%'}}
                                            loading={this.testingConnection}
                                            onClick={this.handleTestConnection}
                                        >
                                            {this.t('login.testConnection')}
                                        </NButton>
                                    </NFormItem>
                                </NForm>
                            </NTabPane>
                            
                            <NTabPane name="register" tab={this.t('login.tabRegister')}>
                                <NForm model={this.registerFormValue} labelPlacement="top">
                                    <NFormItem label={this.t('login.name')} path="name">
                                        <NInput 
                                            value={this.registerFormValue.name}
                                            onUpdateValue={(value: string) => this.registerFormValue.name = value}
                                            placeholder={this.t('login.namePlaceholder')}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label={this.t('login.email')} path="email">
                                        <NInput 
                                            value={this.registerFormValue.email}
                                            onUpdateValue={(value: string) => this.registerFormValue.email = value}
                                            placeholder={this.t('login.emailPlaceholder')}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label={this.t('login.password')} path="password">
                                        <NInput 
                                            value={this.registerFormValue.password}
                                            onUpdateValue={(value: string) => this.registerFormValue.password = value}
                                            type="password"
                                            placeholder={this.t('login.passwordPlaceholder') + ' (минимум 6 символов)'}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label={this.t('login.confirmPassword')} path="confirmPassword">
                                        <NInput 
                                            value={this.registerFormValue.confirmPassword}
                                            onUpdateValue={(value: string) => this.registerFormValue.confirmPassword = value}
                                            type="password"
                                            placeholder={this.t('login.confirmPasswordPlaceholder')}
                                            size="large"
                                            onKeypress={(e: KeyboardEvent) => {
                                                if (e.key === 'Enter') {
                                                    this.handleRegister()
                                                }
                                            }}
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem>
                                        <NButton 
                                            type="primary" 
                                            size="large" 
                                            style={{width: '100%'}}
                                            loading={this.registerLoading}
                                            onClick={this.handleRegister}
                                        >
                                            {this.t('login.registerButton')}
                                        </NButton>
                                    </NFormItem>
                                </NForm>
                            </NTabPane>
                        </NTabs>
                        
                        <div style={{textAlign: 'center', marginTop: '20px'}}>
                            <NText style={{fontSize: '14px', color: '#666'}}>
                                {this.t('login.footerText')}
                            </NText>
                        </div>
                    </NCard>
                </NLayoutContent>
            </NLayout>
        )
    }
})