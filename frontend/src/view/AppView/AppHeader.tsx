import {defineComponent, computed, ref, Fragment} from "vue";
import {RouterLink} from "vue-router";
import {router} from "../../router";
import {isAuthenticated} from "../../utils/api";
import {NGrid, NGridItem, NButton, NInput, NInputGroup} from 'naive-ui'
import CartIcon from '../../components/Cart/CartIcon'
import Cart from '../../components/Cart/Cart'
import { useTranslation } from "../../utils/translations";

export default defineComponent({
    name: "AppHeader",
    setup() {
        const { t } = useTranslation()
        const currentRoute = computed(() => router.currentRoute.value)
        const isUserAuthenticated = computed(() => isAuthenticated())
        const showCart = ref(false)

        const handleCartClick = () => {
            showCart.value = true
        }

        return {
            t,
            currentRoute,
            isUserAuthenticated,
            showCart,
            handleCartClick
        }
    },
    render() {
        return (
            <Fragment>
                <div style={{
                    backgroundColor: '#2d2d2d',
                    borderBottom: '1px solid #404040',
                    padding: '15px 0',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                    <NGrid cols={'12'} style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
                        {/* Логотип и название */}
                        <NGridItem span={3}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#4dabf7',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📱 {this.t('app.companyName')}
                            </div>
                        </NGridItem>

                        {/* Поиск */}
                        <NGridItem span={6}>
                            <NInputGroup style={{width: '100%'}}>
                                <NInput 
                                    placeholder={'Поиск в приложении...'} 
                                    style={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #404040',
                                        color: '#ffffff'
                                    }}
                                />
                                <NButton type="primary">
                                    🔍
                                </NButton>
                            </NInputGroup>
                        </NGridItem>

                        {/* Навигация */}
                        <NGridItem span={3}>
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            }}>
                                <RouterLink to={'/'}>
                                    <NButton ghost size="small" style={{color: '#ffffff'}}>
                                        🏠 Главная
                                    </NButton>
                                </RouterLink>
                                
                                {/* Иконка корзины */}
                                <CartIcon onClick={this.handleCartClick} />
                                
                                {!this.isUserAuthenticated && (
                                    <RouterLink to={'/first_step'}>
                                        <NButton type="info" size="small">
                                            🔑 Войти
                                        </NButton>
                                    </RouterLink>
                                )}
                            </div>
                        </NGridItem>
                    </NGrid>

                    {/* Дополнительная навигация */}
                   
                </div>
                
                {/* Модальное окно корзины */}
                <Cart show={this.showCart} onUpdate:show={(value: boolean) => this.showCart = value} />
            </Fragment>
        )
    }
})
