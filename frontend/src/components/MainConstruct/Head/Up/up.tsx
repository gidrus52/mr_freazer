import {PropType, defineComponent, Ref, h, VNode, computed, watch, ref, onMounted, onUnmounted} from "vue";
import {VpnKeyRound} from '@vicons/material'
import {NSpin, NGridItem, NGrid, NIcon, NButton} from 'naive-ui'
import {RouterLink} from "vue-router";
import {router} from "../../../../router"
import {type RouteRecordRaw} from "vue-router"
import { isAuthenticated, getAdminUser } from "../../../../utils/api"
import { useLanguageStore } from "../../../../stores/languageStore"
import { useTranslation } from "../../../../utils/translations"
// import {type RouteLocationNormalizedLoaded} from "../../../../router"


export default defineComponent({
    props: {
        routeName: {
            type: String as PropType<string>,
            required: true
        }
    },
    setup() {
        const currentRoute: Ref<any> = router.currentRoute
        const fullRoutes: Array<RouteRecordRaw> = router.getRoutes()
        
        // Используем store для языка
        const languageStore = useLanguageStore()
        const { t } = useTranslation()
        
        // Проверяем аутентификацию
        const isUserAuthenticated = computed(() => isAuthenticated())
        const adminUser = computed(() => getAdminUser())
        
        // Отслеживаем изменения статуса авторизации
        watch(isUserAuthenticated, (newValue, oldValue) => {
            if (newValue !== oldValue) {
                console.log('Статус авторизации изменился:', { old: oldValue, new: newValue })
            }
        })
        
        const createUpperName: any = () => {


        }
        
        // Маппинг названий роутов на ключи переводов
        const routeNameMap: { [key: string]: string } = {
            'Main': 'nav.home',
            'Production': 'nav.ourServices',
            'App': 'nav.ourProducts',
            'Login': 'nav.login'
        }
        
        const getDisplayName = (routeName: string | undefined): string => {
            if (!routeName) return ''
            const translationKey = routeNameMap[routeName]
            if (translationKey) {
                return t(translationKey as any)
            }
            return routeName
        }
        
        const getHomeName = (): string => {
            return t('nav.home')
        }
        
        const toggleLanguage = () => {
            languageStore.toggleLanguage()
        }
        
        // Вычисляем флаг реактивно
        const flagClass = computed(() => {
            return languageStore.currentLanguage === 'ru' ? 'fi fi-us' : 'fi fi-ru'
        })
        
        const flagTitle = computed(() => {
            return languageStore.currentLanguage === 'ru' ? 'Switch to English' : 'Переключить на русский'
        })
        
        // Состояние для анимации Telegram
        const isTelegramAnimating = ref(false)
        const isTelegramDisappearing = ref(false)
        let animationInterval: ReturnType<typeof setInterval> | null = null
        
        // Функция для запуска цикла анимации
        const startAnimationCycle = () => {
            // Появление слева направо
            isTelegramDisappearing.value = false
            isTelegramAnimating.value = true
            setTimeout(() => {
                isTelegramAnimating.value = false
                // Иконка показывается 10 секунд, затем исчезает
                setTimeout(() => {
                    isTelegramDisappearing.value = true
                    setTimeout(() => {
                        isTelegramDisappearing.value = false
                    }, 1000) // Длительность исчезновения 1 секунда
                }, 10000) // Показывается 10 секунд
            }, 1000) // Длительность появления 1 секунда
        }
        
        // Запускаем анимацию
        onMounted(() => {
            // Первая анимация сразу
            setTimeout(() => {
                startAnimationCycle()
            }, 100)
            
            // Затем каждые 12 секунд (1 сек появление + 10 сек показ + 1 сек исчезновение)
            animationInterval = setInterval(() => {
                startAnimationCycle()
            }, 12000) // 12 секунд - полный цикл
        })
        
        onUnmounted(() => {
            if (animationInterval) {
                clearInterval(animationInterval)
            }
        })
        
        return {
            currentRoute,
            fullRoutes,
            createUpperName,
            isUserAuthenticated,
            adminUser,
            getDisplayName,
            getHomeName,
            currentLanguage: computed(() => languageStore.currentLanguage),
            toggleLanguage,
            flagClass,
            flagTitle,
            isTelegramAnimating,
            isTelegramDisappearing
        }
    },
    render () {

        const iconState = (() => {
            if (this.routeName == 'Login') {
                return <RouterLink to={'/'}>
                    <NSpin size={15}>

                    </NSpin>
                </RouterLink>
            }
            return <NIcon size={25}>
                <VpnKeyRound></VpnKeyRound>
            </NIcon>
        })()
        
        return (
            <NGrid cols={'8'} style={''}>
                {(() => {
                    let nGiArr: Array<typeof NGridItem> = []
                    
                    // Функция для создания элемента навигации
                    let nodeItem = (toName: string, label?: string ) => {
                        // Если это роут Login и пользователь авторизован, пропускаем его
                        if (label === 'Login' && this.isUserAuthenticated) {
                            return null
                        }
                        
                        // Если это роут Login и пользователь НЕ авторизован, показываем "Login"
                        if (label === 'Login' && !this.isUserAuthenticated) {
                            return (<NGridItem span={2} style={'align-items: center; overflow: hidden;'}>
                                <RouterLink to={label==this.currentRoute.name?'/':toName}>
                                    <div className={'header-element'}>
                                        {label==this.currentRoute.name ? this.getHomeName() : this.getDisplayName(label)}
                                    </div>
                                </RouterLink>
                            </NGridItem>)
                        }
                        
                        // Для всех остальных роутов
                        return (<NGridItem span={label=='Login'?2:1} style={'align-items: center; overflow: hidden;'}>
                            <RouterLink
                                to={label==this.currentRoute.name?'/':toName}>
                                <div className={'header-element'}>
                                    {label==this.currentRoute.name ? (this.currentLanguage.value === 'ru' ? 'Главная' : 'Home') : this.getDisplayName(label)}
                                </div>

                            </RouterLink>
                        </NGridItem>)
                    }
                    
                    // Добавляем основные пункты меню
                    let usedCols = 0
                    this.fullRoutes.map((i) => {
                        // Пропускаем роуты Main, Admin, так как они не должны отображаться в заголовке
                        if (i.name !== 'Main' && i.name !== 'Admin') {
                            const item = nodeItem(i.path, typeof i.name === 'string' ? i.name : undefined)
                            if (item) {
                                nGiArr.push(item)
                                // Подсчитываем использованные колонки
                                if (i.name === 'Login') {
                                    usedCols += 2
                                } else {
                                    usedCols += 1
                                }
                            }
                        }
                    })
                    
                    // Добавляем пустую колонку для выравнивания, если нужно
                    const remainingCols = 8 - usedCols - 1
                    if (remainingCols > 0) {
                        nGiArr.push(
                            <NGridItem span={remainingCols}></NGridItem>
                        )
                    }
                    
                    // Добавляем иконку Telegram и кнопку переключения языка в крайнем правом положении
                    nGiArr.push(
                        <NGridItem span={1} style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingRight: '10px'}}>
                            {/* Иконка Telegram */}
                            <a 
                                href="https://t.me/CDesign_152_processing" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class={this.isTelegramAnimating ? 'telegram-icon-animate' : (this.isTelegramDisappearing ? 'telegram-icon-disappear' : '')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    color: '#0088cc',
                                    position: 'relative'
                                }}
                                title="Telegram канал"
                            >
                                <svg 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 48 48" 
                                    fill="currentColor"
                                    style={{ display: 'block' }}
                                >
                                    <path d="M40.83,8.48c1.14,0,2,1,1.54,2.86l-5.58,26.3c-.39,1.87-1.52,2.32-3.08,1.45L20.4,29.26a.4.4,0,0,1,0-.65L35.77,14.73c.7-.62-.15-.92-1.07-.36L15.41,26.54a.46.46,0,0,1-.4.05L6.82,24C5,23.47,5,22.22,7.23,21.33L40,8.69a2.16,2.16,0,0,1,.83-.21Z"/>
                                </svg>
                            </a>
                            
                            {/* Кнопка переключения языка */}
                            <NButton 
                                type="text"
                                size="small" 
                                onClick={this.toggleLanguage}
                                class="language-button-no-border"
                                style={{
                                    minWidth: '50px', 
                                    padding: '5px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    boxShadow: 'none',
                                    backgroundColor: 'transparent'
                                }}
                                title={this.flagTitle}
                            >
                                <span 
                                    class={this.flagClass}
                                    style={{
                                        display: 'inline-block',
                                        width: '32px',
                                        height: '24px',
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center'
                                    }}
                                ></span>
                            </NButton>
                        </NGridItem>
                    )
                    
                    return nGiArr
                })()}

            </NGrid>

        )
    }
})