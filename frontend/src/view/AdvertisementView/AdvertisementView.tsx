import {defineComponent} from "vue";
import CategoryList from "../../components/Advertisement/CategoryList"
import {NSpace,NLayout} from 'naive-ui'

export default defineComponent({
    render() {
        return (
            <NLayout>
                <CategoryList/>

            </NLayout>

        )
    }
})