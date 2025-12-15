import {defineComponent} from "vue";
import {NLayoutFooter, NSpace} from "naive-ui";

export default defineComponent({
    name: "Footer",
    render () {
       return (
           <NLayoutFooter  position={''}>
                    <NSpace style={'height:5vm'}>1</NSpace>

           </NLayoutFooter>
       )
    },
})