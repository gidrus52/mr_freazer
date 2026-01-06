import {NScrollbar, NPageHeader, NGridItem, NGrid, NIcon, NImage, NFlex} from 'naive-ui'
import {LocationOnOutlined, LocalPhoneRound, AccessTimeFilled, ExpandCircleDownOutlined, EmailOutlined} from '@vicons/material'
import {defineComponent,  ref, computed} from "vue";
import {useTemplateRef} from "vue";

import MilingIcon from "../assets/img/icons/milling";
import TelegramIcon from "../assets/img/icons/telegramIcon";
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
                                        <div class="contact-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px'}}>
                                            <TelegramIcon fillColor="#0088cc" width={24} height={24} />
                                        </div>
                                        <div class="contact-text">
                                            <div class="contact-label">{this.t('main.telegram')}</div>
                                            <div class="contact-value">@deniswasmaked87</div>
                                            <div class="contact-value"></div>
                                        </div>
                                    </div>
                                </a>
                                <div class="contact-item">
                                    <NIcon size={24} class="contact-icon">
                                        <EmailOutlined></EmailOutlined>
                                    </NIcon>
                                    <div class="contact-text">
                                        <div class="contact-label">{this.t('main.email')}</div>
                                        <a href="mailto:forsalenn@gmail.com" style={{color: '#0088cc', textDecoration: 'none'}}>
                                            <div class="contact-value">forsalenn@gmail.com</div>
                                        </a>
                                        <div class="contact-value"></div>
                                    </div>
                                </div>
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