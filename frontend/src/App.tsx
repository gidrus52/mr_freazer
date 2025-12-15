import {defineComponent, ref} from 'vue'
import {NConfigProvider, darkTheme, NMessageProvider} from 'naive-ui'
import {NLayout, NIcon, NSpin, NSpace} from 'naive-ui'

import Header from "./components/MainConstruct/Head/Header";
import Body from "./components/MainConstruct/Body/Body";
import Footer from "./components/MainConstruct/Footer/footer";

export default defineComponent({
    setup() {

        return {
            darkTheme,
        }
    },

    render() {
        return (
            <NConfigProvider theme={this.darkTheme}>
                <NMessageProvider>
                    <NSpace vertical style={{height: '100vh', overflow: 'hidden', margin: 0, padding: 0}}>
                        <NLayout position={'absolute'} nativeScrollbar={false} style={{height: '100vh', overflow: 'hidden'}}>
                            <Header/>
                            <Body/>

                        </NLayout>
                    </NSpace>
                </NMessageProvider>
            </NConfigProvider>
        )
    }

})

