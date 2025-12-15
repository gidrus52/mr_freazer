import {defineComponent, ref, computed} from "vue";
import {VpnKeyRound} from '@vicons/material'
import UpHead from './Up/up'
import BottomHead from './Bottom/bottom'
import {router} from "../../../router";
import {NLayoutHeader, NGrid, NGridItem, NLayout, NIcon, NSpin, NInput, NButton, NInputGroup, NDivider,} from 'naive-ui'
import { isAuthenticated } from "../../../utils/api"


export default defineComponent({
    name: "Header",
    setup() {
        // Проверяем аутентификацию
        const isUserAuthenticated = computed(() => isAuthenticated())
        const currentRoute = computed(() => router.currentRoute.value)

        return {
            router,
            isUserAuthenticated,
            currentRoute
        }
    },
    render() {

        return (
            <NLayoutHeader position={'static'} style={'position: '}>

                    <NGrid cols={'1'}>
                        <NGridItem><UpHead routeName={this.currentRoute?.name || 'Main'}></UpHead></NGridItem>
                        <NGridItem><BottomHead></BottomHead></NGridItem>
                    </NGrid>

            </NLayoutHeader>
        )
    }
})