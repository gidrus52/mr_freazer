import { defineComponent, ref, computed, onMounted } from 'vue'
import { NLayout, NLayoutContent, NCard, NText, NButton, NSpace, NDivider, NTabs, NTabPane, createDiscreteApi } from 'naive-ui'
import { useRouter } from 'vue-router'
import { isAuthenticated, logout, getAdminUser } from '../../utils/api'
import OrderList from '../../components/Orders/OrderList'
import { useTranslation } from '../../utils/translations'

const { message } = createDiscreteApi(['message'])

export default defineComponent({
    name: 'UserCabinetView',
    setup() {
        const router = useRouter()
        const { t } = useTranslation()
        const user = computed(() => getAdminUser())
        const isUserAuthenticated = computed(() => isAuthenticated())

        // Автоматический переход в админ панель для администраторов
        onMounted(() => {
            if (isUserAuthenticated.value && user.value?.role === 'admin') {
                router.push('/admin')
            }
        })

        const handleLogout = () => {
            logout()
            message.success('Вы успешно вышли из системы')
            router.push('/')
        }

        const goToAdmin = () => {
            router.push('/admin')
        }

        return {
            user,
            isUserAuthenticated,
            handleLogout,
            goToAdmin,
            t
        }
    },
    render() {
        if (!this.isUserAuthenticated) {
            return (
                <NLayout>
                    <NLayoutContent style="padding: 20px;">
                        <NCard>
                            <NText>{this.t('cabinet.accessDenied')}</NText>
                        </NCard>
                    </NLayoutContent>
                </NLayout>
            )
        }

        return (
            <NLayout>
                <NLayoutContent style="padding: 20px;">
                    <NCard title={this.t('cabinet.title')}>
                        <NTabs type="line" animated>
                            <NTabPane name="profile" tab={this.t('cabinet.profile')}>
                                <NSpace vertical size="large">
                                    <div>
                                        <NText strong>{this.t('cabinet.welcome')}</NText>
                                        {this.user && (
                                            <div style="margin-top: 10px;">
                                                <NText>{this.t('cabinet.email')}: {this.user.email}</NText>
                                                <br />
                                                <NText>{this.t('cabinet.name')}: {this.user.name}</NText>
                                                <br />
                                                {this.user.id && (
                                                    <>
                                                        <NText>{this.t('cabinet.id')}: {this.user.id}</NText>
                                                        <br />
                                                    </>
                                                )}
                                                <NText>{this.t('cabinet.role')}: {this.user.role === 'admin' ? this.t('cabinet.roleAdmin') : this.t('cabinet.roleUser')}</NText>
                                            </div>
                                        )}
                                    </div>

                                    <NDivider />

                                    <div>
                                        <NText strong>{this.t('cabinet.actions')}</NText>
                                        <NSpace style="margin-top: 10px;">
                                            {this.user?.role === 'admin' && (
                                                <NButton type="primary" onClick={this.goToAdmin}>
                                                    {this.t('cabinet.adminPanel')}
                                                </NButton>
                                            )}
                                            <NButton type="error" onClick={this.handleLogout}>
                                                {this.t('cabinet.logout')}
                                            </NButton>
                                        </NSpace>
                                    </div>

                                    <NDivider />

                                    <div>
                                        <NText strong>Информация:</NText>
                                        <div style="margin-top: 10px;">
                                            <NText>{this.t('cabinet.info')}</NText>
                                        </div>
                                    </div>
                                </NSpace>
                            </NTabPane>
                            
                            <NTabPane name="orders" tab={this.t('cabinet.orders')}>
                                <OrderList showUserOrdersOnly={true} />
                            </NTabPane>
                        </NTabs>
                    </NCard>
                </NLayoutContent>
            </NLayout>
        )
    }
})
