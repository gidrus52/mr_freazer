import { defineComponent, type PropType} from "vue";
import MainIcon from '../../../../assets/img/icons/mainIcon.svg'
import {router} from "../../../../router"

import {NGridItem, NGrid, NButton, NInput, NInputGroup} from 'naive-ui'

export default defineComponent({

    setup () {
        const routeName = router.currentRoute

        return {
            routeName,
            MainIcon
        }
    },
    render () {
        return(null)
    }
})