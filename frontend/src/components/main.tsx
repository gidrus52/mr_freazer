import {NScrollbar, NPageHeader, NGridItem, NGrid, NIcon, NImage, NFlex} from 'naive-ui'
import {LocationOnOutlined, LocalPhoneRound, AccessTimeFilled, ExpandCircleDownOutlined} from '@vicons/material'
import {defineComponent,  ref, computed} from "vue";
import {useTemplateRef} from "vue";

import MilingIcon from "../assets/img/icons/milling";
import backgroundImage from "../assets/img/background/back_01.jpg";
import { getImageUrl } from "../utils/imageUtils";
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
                <div class="main-page">
                    <div class="main-header">
                        <div class="main-header-content">
                            <div class="main-logo">
                                <div class="logo-text">МИСТЕР ФРЕЗЕР</div>
                                <NImage width={80} height={80} src={getImageUrl("icons/777777.png")} class="logo-image"/>
                            </div>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <NIcon size={24} class="contact-icon">
                                        <LocationOnOutlined></LocationOnOutlined>
                                    </NIcon>
                                    <div class="contact-text">
                                        <div class="contact-label">Адрес</div>
                                        <div class="contact-value">{this.t('main.address')}</div>
                                        <div class="contact-value">{this.t('main.city')}</div>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <NIcon size={24} class="contact-icon">
                                        <AccessTimeFilled></AccessTimeFilled>
                                    </NIcon>
                                    <div class="contact-text">
                                        <div class="contact-label">Время работы</div>
                                        <div class="contact-value">{this.t('main.workDays')}</div>
                                        <div class="contact-value">{this.t('main.workHours')}</div>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <NIcon size={24} class="contact-icon">
                                        <LocalPhoneRound></LocalPhoneRound>
                                    </NIcon>
                                    <div class="contact-text">
                                        <div class="contact-label">Телефон</div>
                                        <div class="contact-value">+7 (495) 728-5000</div>
                                        <div class="contact-value">+7 (495) 728-6000</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="main-hero">
                        <div class="hero-background" style={{backgroundImage: `url(${backgroundImage})`}}></div>
                        <div class="hero-content">
                            <h1 class="hero-title">МИСТЕР ФРЕЗЕР</h1>
                            <p class="hero-subtitle">Профессиональные услуги по металлообработке</p>
                        </div>
                    </div>
                    <div class="services-section">
                        <div class="services-grid">
                            <div class="service-card">
                                <div class="service-icon">
                                    <NIcon size={40}>
                                        <ExpandCircleDownOutlined/>
                                    </NIcon>
                                </div>
                                <h3 class="service-title">{this.t('main.milling')}</h3>
                                <p class="service-description">{this.t('main.millingDesc')}</p>
                            </div>
                            <div class="service-card">
                                <div class="service-icon">
                                    <NIcon size={40}>
                                        <ExpandCircleDownOutlined/>
                                    </NIcon>
                                </div>
                                <h3 class="service-title">{this.t('main.turning')}</h3>
                                <p class="service-description">{this.t('main.turningDesc')}</p>
                            </div>
                            <div class="service-card">
                                <div class="service-icon">
                                    <NIcon size={40}>
                                        <ExpandCircleDownOutlined/>
                                    </NIcon>
                                </div>
                                <h3 class="service-title">{this.t('main.welding')}</h3>
                                <p class="service-description">{this.t('main.weldingDesc')}</p>
                            </div>
                            <div class="service-card">
                                <div class="service-icon">
                                    <NIcon size={40}>
                                        <ExpandCircleDownOutlined/>
                                    </NIcon>
                                </div>
                                <h3 class="service-title">{this.t('main.cutting')}</h3>
                                <p class="service-description">{this.t('main.cuttingDesc')}</p>
                            </div>
                        </div>
                    </div>    
                </div>
            )
        }

    }
)

export default MainPage