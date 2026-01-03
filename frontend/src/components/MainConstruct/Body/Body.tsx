import {defineComponent, Ref, ref} from "vue";
import {VpnKeyRound} from '@vicons/material'
import {router} from "../../../router";
import {RouterView} from "vue-router";
import {NLayoutContent,NScrollbar, NGrid, NGridItem, NIcon, NSpin, NLayout} from 'naive-ui'



export default defineComponent({
    name: "Main Contetn",
    setup() {
        const currentRoute: Ref<any> = router.currentRoute
        return {
            currentRoute
        }
    },
    render() {
        return (
                <NLayout position={'static'} nativeScrollbar={''} style={this.currentRoute.name === 'Main' ? {background: '#1a1a1a', margin: 0, padding: 0} : {marginTop: '9vh'}}>
                    {/*<div style={this.currentRoute.name == 'Advertisement' ? 'height: 7rem;' : 'height: 0rem;'}></div>*/}
                    {this.currentRoute.name === 'Main' ? (
                        <div style={{height: 'calc(100vh - 9vh)', overflow: 'hidden', margin: 0, padding: 0, background: '#1a1a1a'}} class="main-page-container">
                            <RouterView/>
                        </div>
                    ) : (
                        <NScrollbar style={'height: 91vh'}>
                            <RouterView/>
                        </NScrollbar>
                    )}
                </NLayout>
        )
    }
})