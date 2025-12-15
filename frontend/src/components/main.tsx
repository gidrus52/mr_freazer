import {NScrollbar, NPageHeader, NGridItem, NGrid, NIcon, NImage, NFlex} from 'naive-ui'
import {LocationOnOutlined, LocalPhoneRound, AccessTimeFilled, ExpandCircleDownOutlined} from '@vicons/material'
import {defineComponent,  ref, computed} from "vue";
import {useTemplateRef} from "vue";

import MilingIcon from "../assets/img/icons/milling";
import backgroundImage from "../assets/img/background/back_01.jpg";
import { useTranslation } from "../utils/translations";


const MainPage = defineComponent({
        name: "MainPage",
        setup() {
            const { t } = useTranslation()
            const fontSize: number = 40
            return {
                fontSize,
                t
            }
        },
        render() {
            return (
                <NFlex vertical style={{height: '100%', overflow: 'hidden', boxSizing: 'border-box', margin: 0, padding: 0}} justify={'space-between'} align={'center'}>
                    <NFlex style={{flexDirection: 'row', height: 'auto', flexShrink: 0, padding: '10px 0'}} align={'center'} justify={'space-around'}>
                        <NFlex style={'flex-direction: row; flex-wrap: nowrap;'} align={'center'}>
                            <NFlex align={'center'} justify={'center'} class={'name_inner_block'}>МИСТЕР
                                ФРЕЗЕР
                            </NFlex>
                            <NFlex>
                                <NImage width={300} src={"src/assets/img/icons/777777.png"}/></NFlex>
                        </NFlex>
                        <NFlex style={'flex-direction: row; flex-wrap: nowrap;'} align={'center'}>
                            <NFlex>
                                <NIcon size={this.fontSize}>
                                    <LocationOnOutlined></LocationOnOutlined>
                                </NIcon>
                            </NFlex>
                            <NFlex>
                                <NFlex>
                                    <div>{this.t('main.address')}</div>
                                    <div>{this.t('main.city')}</div>
                                </NFlex>
                            </NFlex>
                        </NFlex>
                        <NFlex style={'flex-direction: row; flex-wrap: nowrap;'} align={'center'}>
                            <NFlex>
                                <NIcon size={this.fontSize}>
                                    <AccessTimeFilled></AccessTimeFilled>
                                </NIcon>
                            </NFlex>
                            <NFlex>
                                <NFlex>
                                    <div>{this.t('main.workDays')}</div>
                                    <div>{this.t('main.workHours')}</div>
                                </NFlex>
                            </NFlex>
                        </NFlex>
                        <NFlex style={'flex-direction: row; flex-wrap: nowrap;'} align={'center'}>
                            <NFlex span={1}>
                                <NIcon size={this.fontSize}>
                                    <LocalPhoneRound></LocalPhoneRound>
                                </NIcon>
                            </NFlex>
                            <NFlex span={1}>
                                <NGrid cols={1}>
                                    <NGridItem>+7 (495) 728-5000 </NGridItem>
                                    <NGridItem>+7 (495) 728-6000 </NGridItem>
                                </NGrid>
                            </NFlex>
                        </NFlex>
                    </NFlex>
                    <NFlex style={{height: '33vh', width: '100%', flexShrink: 0}}><NGrid cols={1} style={{height: '100%'}} align={'center'}>
                        <NGridItem style={{height: '100%'}}>
                            <div 
                                class={'main_block main_background_block'}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    backgroundImage: `url(${backgroundImage})`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: '-800px -1800px',
                                    color: '#888888',
                                    display: 'block'
                                }}
                            >1</div>
                        </NGridItem>
                    </NGrid></NFlex>
                    <NFlex align={'center'} justify={'space-around'} style={{flexDirection: 'row', flexWrap: 'nowrap', flex: '1 1 auto', minHeight: 0, flexShrink: 0}}>
                        <NFlex align={'center'}>
                            <NFlex>
                                <NIcon size={60}>
                                    <ExpandCircleDownOutlined/>
                                </NIcon>
                            </NFlex>
                            <NFlex>
                                <NFlex>
                                    <NFlex>{this.t('main.milling')}</NFlex>
                                    <NFlex>{this.t('main.millingDesc')}</NFlex>
                                </NFlex>

                            </NFlex>


                        </NFlex>
                        <NFlex align={'center'} style={'flex-direction: row;'}>
                            <NFlex>
                                <NIcon size={60}>
                                    <ExpandCircleDownOutlined/>
                                </NIcon>
                            </NFlex>
                            <NFlex>
                                <NFlex>
                                    <NFlex>{this.t('main.turning')}</NFlex>
                                    <NFlex>{this.t('main.turningDesc')}</NFlex>
                                </NFlex>
                            </NFlex>

                        </NFlex>
                        <NFlex align={'center'}>
                            <NFlex>
                                <NIcon size={60}>
                                    <ExpandCircleDownOutlined/>
                                </NIcon>
                            </NFlex>
                            <NFlex>
                                <NFlex>
                                    <NFlex>{this.t('main.welding')}</NFlex>
                                    <NFlex>{this.t('main.weldingDesc')}</NFlex>
                                </NFlex>

                            </NFlex>
                        </NFlex>
                        <NFlex align={'center'}>
                            <NFlex>
                                <NIcon size={60}>
                                    <ExpandCircleDownOutlined/>
                                </NIcon>
                            </NFlex>
                            <NFlex>
                                <NFlex>
                                    <NFlex>{this.t('main.cutting')}</NFlex>
                                    <NFlex>{this.t('main.cuttingDesc')}</NFlex>
                                </NFlex>
                            </NFlex>
                        </NFlex>
                    </NFlex>
                </NFlex>



            )
        }

    }
)

export default MainPage