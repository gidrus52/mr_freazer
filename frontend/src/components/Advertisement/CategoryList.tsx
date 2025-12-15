import {defineComponent, ref, computed, h} from "vue";
import {NGrid, NGridItem, NSpace, NCard, NCarousel, NButton} from "naive-ui";
import {useWindowSize} from 'vue-window-size';
import HeartIcon from '../../assets/img/icons/filledHerat'


export default defineComponent({

    setup() {
        console.log(import.meta.env)
        const {width} = useWindowSize()
        const filledHeart = () => {
            return (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                     xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" fill="red"
                     viewBox="0 0 512 512" enable-background="new 0 0 512 512"
                     xml:space="preserve"><path d="M352,56C352,56,352,56,352,56C352,56,352,56,352,56c-0.3,0-0.7,0-1,0c-39.7,0-74.8,21-95,52c-20.2-31-55.3-52-95-52
\tc-0.3,0-0.7,0-1,0c0,0,0,0,0,0c0,0,0,0,0,0C98.1,56.6,48,106.9,48,169c0,37,16.2,89.5,47.8,132.7C156,384,256,456,256,456
\ts100-72,160.2-154.3C447.8,258.5,464,206,464,169C464,106.9,413.9,56.6,352,56z"></path></svg>
            )
        }
        let gridArray: ref<[number]> = ref([])
        let isReadyGridArray: ref<boolean> = ref(false)
        let calculateColumnRef: ref<number> = ref(1)
        let advertiseQuantity = [
            {
                data: {
                    name: 'default',
                    like: false,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://vsegda-pomnim.com/uploads/posts/2022-04/1649691766_122-vsegda-pomnim-com-p-krasivie-belie-tsveti-foto-149.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: true,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://catherineasquithgallery.com/uploads/posts/2021-02/1614196940_25-p-tsveti-na-chernom-fone-kartinki-34.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: false,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://wdorogu.ru/images/wp-content/uploads/beautiful-flower-bouquets-88.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: false,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://catherineasquithgallery.com/uploads/posts/2023-02/1676736733_catherineasquithgallery-com-p-raznie-tsveti-na-zelenom-fone-137.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: false,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://mykaleidoscope.ru/uploads/posts/2022-06/1656065981_19-mykaleidoscope-ru-p-tsveti-rozovogo-tsveta-krasivo-foto-19.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: false,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://mykaleidoscope.ru/uploads/posts/2022-06/1656069833_4-mykaleidoscope-ru-p-tsveti-s-prazdnikom-krasivo-foto-4.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: true,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://i.pinimg.com/originals/95/22/c6/9522c66c450f36f24f870d862694fbfe.jpg'
            },
            {
                data: {
                    name: 'default',
                    like: false,
                    address: 'default',
                    delivery: false,
                    prise: `1000$`
                },
                img: 'https://pic.xenomorph.ru/2013-06/1372180267_11.jpg'
            },
        ]

        const colsGrid = computed({
            get: () => {
            },
            set: (a) => {
                if (a > 1000) {
                    calculateColumnRef.value = 5
                }
                if (a > 600 && a < 1000) {
                    calculateColumnRef.value = 4
                }
                if (a > 400 && a < 600) {
                    calculateColumnRef.value = 3
                }
            }
        })

        return {
            filledHeart,
            advertiseQuantity,
            width,
            colsGrid,
            calculateColumnRef,
            isReadyGridArray,
            gridArray
        }
    },
    render() {
        this.colsGrid = this.width
        return (
            <NGrid cols={1}>
                <NGridItem>
                    <NGrid cols={12}>
                        <NGridItem span={12}>
                            <div
                                style={'display: flex; flex-direction: column; justify-content: space-between; margin: 10px; '}>
                                <NGrid cols={12} x-gap={12} y-gap={12} item-responsive>
                                    <NGridItem class={'category-element'} span={'2 600:2 1000:3'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:2 1000:0'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:4 1000:2'}>item3</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:0 1000:2'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:0 1000:3'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:4 1000:2'}>item </NGridItem>

                                </NGrid>
                                <NSpace>
                                    <div style={'width=100%; height: 25px'}></div>
                                </NSpace>
                                <NGrid cols={12} x-gap={12} y-gap={12} item-responsive>
                                    <NGridItem class={'category-element'} span={'2 600:4 1000:3'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:2 1000:2'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:0 1000:2'}>item3</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:2 1000:2'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:0 1000:0'}>item</NGridItem>
                                    <NGridItem class={'category-element'} span={'2 600:4 1000:3'}>item </NGridItem>
                                </NGrid>
                            </div>
                        </NGridItem>
                    </NGrid>
                </NGridItem>
                <NGridItem style={'margin: 20px 10px 0 10px;'}>
                    <NGrid cols={this.calculateColumnRef} item-responsive x-gap={15} y-gap={15}>
                        {this.advertiseQuantity.map(i => {
                            return (
                                <NGridItem>
                                    <NGrid cols={1}>
                                        <NGridItem>
                                            <NCard>
                                                {{
                                                    default: () =>
                                                        <NCarousel
                                                            autoplay={true}
                                                            interval={14500}
                                                            draggable={true}
                                                            show-dots={false}
                                                        >
                                                            {this.advertiseQuantity.map(i =>
                                                                <img src={i.img} alt=""
                                                                     style={'height: 100%; width: 100%;'}/>
                                                            )}
                                                        </NCarousel>
                                                }}
                                            </NCard>
                                        </NGridItem>
                                        <NGridItem>
                                            <NCard>
                                                <NGrid cols={12}>
                                                    <NGridItem span={10}>{i.data.name}</NGridItem>
                                                    <NGridItem>
                                                        <HeartIcon fillColor={i.data.like ? 'red' : ''}/>
                                                    </NGridItem>
                                                </NGrid>
                                                <NGrid cols={4}>
                                                    <NGridItem span={3}>{i.data.prise}</NGridItem>
                                                    <NGridItem>delivery</NGridItem>
                                                </NGrid>
                                                <NGrid cols={4}>
                                                    <NGridItem span={3}>placement</NGridItem>
                                                    <NGridItem>date</NGridItem>
                                                </NGrid>
                                            </NCard>
                                        </NGridItem>
                                    </NGrid>
                                </NGridItem>
                            )
                        })}
                    </NGrid>
                </NGridItem>
            </NGrid>
        )
    }
})