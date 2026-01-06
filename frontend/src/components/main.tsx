import {NScrollbar, NPageHeader, NGridItem, NGrid, NIcon, NImage, NFlex} from 'naive-ui'
import {LocationOnOutlined, LocalPhoneRound, AccessTimeFilled, ExpandCircleDownOutlined, EmailOutlined} from '@vicons/material'
import {defineComponent,  ref, computed, h} from "vue";
import {useTemplateRef} from "vue";

import MilingIcon from "../assets/img/icons/milling";
import backgroundImage from "../assets/img/background/back_01.jpg";
import { getImageUrl } from "../utils/imageUtils";
import { useTranslation } from "../utils/translations";

// Компонент иконки Telegram, аналогичный EmailOutlined
const TelegramOutlined = defineComponent({
    name: 'TelegramOutlined',
    render() {
        return h('svg', {
            viewBox: '0 0 48 48',
            fill: 'currentColor',
            xmlns: 'http://www.w3.org/2000/svg'
        }, [
            h('path', {
                d: 'M40.83,8.48c1.14,0,2,1,1.54,2.86l-5.58,26.3c-.39,1.87-1.52,2.32-3.08,1.45L20.4,29.26a.4.4,0,0,1,0-.65L35.77,14.73c.7-.62-.15-.92-1.07-.36L15.41,26.54a.46.46,0,0,1-.4.05L6.82,24C5,23.47,5,22.22,7.23,21.33L40,8.69a2.16,2.16,0,0,1,.83-.21Z'
            })
        ])
    }
})


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
                                <div class="logo-text">{this.t('main.companyName')}</div>
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
                                <a href="https://t.me/deniswasmaked87" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit', display: 'contents'}}>
                                    <div class="contact-item" style={{cursor: 'pointer'}}>
                                        <NIcon size={24} class="contact-icon">
                                            <TelegramOutlined></TelegramOutlined>
                                        </NIcon>
                                        <div class="contact-text">
                                            <div class="contact-label">{this.t('main.telegram')}</div>
                                            <div class="contact-value"></div>
                                            <div class="contact-value"></div>
                                        </div>
                                    </div>
                                </a>
                                <a href="mailto:forsalenn@gmail.com" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit', display: 'contents'}}>
                                    <div class="contact-item" style={{cursor: 'pointer'}}>
                                        <NIcon size={24} class="contact-icon">
                                            <EmailOutlined></EmailOutlined>
                                        </NIcon>
                                        <div class="contact-text">
                                            <div class="contact-label">{this.t('main.email')}</div>
                                            <div class="contact-value" style={{opacity: 0.1, fontSize: '1px'}}>forsalenn@gmail.com</div>
                                            <div class="contact-value"></div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="main-hero">
                        <div class="hero-background" style={{backgroundImage: `url(${backgroundImage})`}}></div>
                        <div class="hero-content">
                            <h1 class="hero-title">{this.t('main.companyName')}</h1>
                            <p class="hero-subtitle">{this.t('main.heroSubtitle')}</p>
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