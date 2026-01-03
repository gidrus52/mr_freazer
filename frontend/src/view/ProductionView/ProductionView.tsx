import {
    NLayout,
    NPageHeader,
    NGridItem,
    NGrid,
    NIcon,
    NSpace,
    NImage,
    NButton,
    NDivider,
    NScrollbar,
    NFlex,
    NCard,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    useMessage
} from 'naive-ui'
import {LocationOnOutlined, LocalPhoneRound, AccessTimeFilled, ExpandCircleDownOutlined} from '@vicons/material'
import {defineComponent, ref, computed, useTemplateRef, onMounted, onUnmounted} from "vue";
import type { JSX } from 'vue/jsx-runtime'
import type {Ref} from 'vue'
import type { HTMLAttributes, VNode } from 'vue'
import VKIcon from "../../assets/img/icons/vk";
import TelegramIcon from "../../assets/img/icons/telegramIcon";
import AvitoIcon from "../../assets/img/icons/avitoIcon";
import InstagramIcon from "../../assets/img/icons/instagramm";
import YoutubeIcon from "../../assets/img/icons/youtubeIcon";
import defaultSocialIcon from '../../assets/img/icons/socialICon'
import youtubeIcon from "../../assets/img/icons/youtubeIcon";
import { useTranslation } from "../../utils/translations";
import { countries, defaultCountry, type Country } from "../../utils/countries";
import { useLanguageStore } from "../../stores/languageStore";
import { getImageUrl } from "../../utils/imageUtils";

// import dffg  from '../../assets/img/background/back_01.jpg'

// Типы для EmailJS
declare global {
    interface Window {
        emailjs: {
            send: (serviceId: string, templateId: string, templateParams: any, publicKey: string) => Promise<any>
        }
    }
}


const ProductionView = defineComponent({
        setup() {
            const { t } = useTranslation()
            const languageStore = useLanguageStore()
            const sections = ['topBlock', 'nextBlock_1', 'nextBlock_2', 'nextBlock_3']
            let currentIndex = 0
            let lastScrollTime = 0
            const SCROLL_DELAY = 500 // 500ms delay

            // Состояние для модального окна и формы
            const showModal = ref(false)
            const selectedCountry = ref<Country>(defaultCountry)
        const formData = ref({
            name: '',
            phone: '',
            comment: ''
        })
            const loading = ref(false)
            const message = useMessage()

            // Состояние для карусели изображений
            const currentImageIndex = ref({
                topBlock: 0,
                nextBlock_1: 0,
                nextBlock_2: 0,
                nextBlock_3: 0
            })

            // Состояние для навигации
            const showNavigation = ref(false)

            // Автопрокрутка изображений
            let autoScrollIntervals: { [key: string]: number } = {}
            const AUTO_SCROLL_INTERVAL = 3000 // 3 секунды

            const startAutoScroll = (blockId: string) => {
                // Останавливаем предыдущий интервал, если есть
                if (autoScrollIntervals[blockId]) {
                    clearInterval(autoScrollIntervals[blockId])
                }
                
                // Запускаем новый интервал
                autoScrollIntervals[blockId] = setInterval(() => {
                    nextImage(blockId)
                }, AUTO_SCROLL_INTERVAL) as unknown as number
            }

            const stopAutoScroll = (blockId: string) => {
                if (autoScrollIntervals[blockId]) {
                    clearInterval(autoScrollIntervals[blockId])
                    delete autoScrollIntervals[blockId]
                }
            }

            // Динамическое определение размеров экрана для мобильных устройств
            const updateScreenDimensions = () => {
                if (typeof window !== 'undefined') {
                    const width = window.innerWidth
                    const height = window.innerHeight
                    const isMobile = width <= 768 // Мобильное устройство
                    
                    if (isMobile) {
                        // Устанавливаем CSS переменные для размеров экрана
                        document.documentElement.style.setProperty('--mobile-screen-width', `${width}px`)
                        document.documentElement.style.setProperty('--mobile-screen-height', `${height}px`)
                        // Ширина контента - немного меньше ширины экрана для отступов
                        const contentWidth = Math.min(width - 20, 400) // Максимум 400px, но не больше ширины экрана минус отступы
                        document.documentElement.style.setProperty('--mobile-content-width', `${contentWidth}px`)
                    } else {
                        // Для десктопа сбрасываем переменные
                        document.documentElement.style.setProperty('--mobile-screen-width', 'auto')
                        document.documentElement.style.setProperty('--mobile-screen-height', 'auto')
                        document.documentElement.style.setProperty('--mobile-content-width', 'auto')
                    }
                }
            }

            // Запускаем автопрокрутку при монтировании
            onMounted(() => {
                updateScreenDimensions()
                window.addEventListener('resize', updateScreenDimensions)
                window.addEventListener('orientationchange', updateScreenDimensions)
                startAutoScroll('topBlock')
                startAutoScroll('nextBlock_1')
                startAutoScroll('nextBlock_2')
                startAutoScroll('nextBlock_3')
            })

            // Останавливаем автопрокрутку при размонтировании
            onUnmounted(() => {
                window.removeEventListener('resize', updateScreenDimensions)
                window.removeEventListener('orientationchange', updateScreenDimensions)
                stopAutoScroll('topBlock')
                stopAutoScroll('nextBlock_1')
                stopAutoScroll('nextBlock_2')
                stopAutoScroll('nextBlock_3')
            })

            // Массивы изображений для каждого блока
            const blockImages = {
                topBlock: [
                    getImageUrl("productionpage/KorpPress/1.png"),
                    getImageUrl("productionpage/KorpPress/2.png"),
                    getImageUrl("productionpage/KorpPress/3.png"),
                    getImageUrl("productionpage/KorpPress/4.png"),
                    getImageUrl("productionpage/KorpPress/5.png")
                ],
                nextBlock_1: [
                    getImageUrl("productionpage/Rem/1.png"),
                    getImageUrl("productionpage/Rem/2.png"),
                    getImageUrl("productionpage/Rem/3.png"),
                    getImageUrl("productionpage/Rem/4.webp")
                ],
                nextBlock_2: [
                   getImageUrl("productionpage/Zvezda/1.png"),
                    getImageUrl("productionpage/Zvezda/2.png"),
                ],
                nextBlock_3: [
                    getImageUrl("productionpage/Brake/1.png"),
                    getImageUrl("productionpage/Brake/2.png")
                ]
            }

            const scrollToSection = (index: number): void => {
                const element = document.getElementById(sections[index])
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    })
                    currentIndex = index
                }
            }

            // Функции для управления каруселью
            const nextImage = (blockId: string) => {
                const currentIndex = currentImageIndex.value[blockId as keyof typeof currentImageIndex.value]
                const maxIndex = blockImages[blockId as keyof typeof blockImages].length - 1
                currentImageIndex.value[blockId as keyof typeof currentImageIndex.value] = 
                    currentIndex >= maxIndex ? 0 : currentIndex + 1
            }

            const prevImage = (blockId: string) => {
                const currentIndex = currentImageIndex.value[blockId as keyof typeof currentImageIndex.value]
                const maxIndex = blockImages[blockId as keyof typeof blockImages].length - 1
                currentImageIndex.value[blockId as keyof typeof currentImageIndex.value] = 
                    currentIndex <= 0 ? maxIndex : currentIndex - 1
            }

            const getCurrentImage = (blockId: string) => {
                const index = currentImageIndex.value[blockId as keyof typeof currentImageIndex.value]
                return blockImages[blockId as keyof typeof blockImages][index]
            }

            // Состояние для задержки переключения картинок
            let lastImageScrollTime = 0
            const IMAGE_SCROLL_DELAY = 300 // 300ms delay для переключения картинок
            
            // Обработчик скролла для переключения картинок
            const handleImageWheel = (event: WheelEvent, blockId: string) => {
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()
                
                const now = Date.now()
                if (now - lastImageScrollTime < IMAGE_SCROLL_DELAY) {
                    return // Skip if not enough time has passed
                }
                lastImageScrollTime = now
                
                // Переключение картинок при скролле
                if (event.deltaY > 0) { // Scrolling down - следующая картинка
                    nextImage(blockId)
                } else if (event.deltaY < 0) { // Scrolling up - предыдущая картинка
                    prevImage(blockId)
                }
            }

            // Функции для навигации
            const toggleNavigation = () => {
                showNavigation.value = !showNavigation.value
            }

            const navigateToBlock = (blockId: string) => {
                const blockIndex = sections.indexOf(blockId)
                if (blockIndex !== -1) {
                    currentIndex = blockIndex
                    scrollToSection(currentIndex)
                    showNavigation.value = false
                }
            }

            const handleWheel = (event: WheelEvent): void => {
                // Проверяем, не пришло ли событие из области изображения
                const target = event.target as HTMLElement
                
                // Проверяем все возможные варианты: контейнер изображения, само изображение, или родительский элемент
                const imageContainer = target.closest('[data-image-container]')
                const isImage = target.tagName === 'IMG'
                const isInImageContainer = target.closest('.carousel-container')
                
                // Если событие пришло из области изображения, игнорируем его
                if (imageContainer || isImage || isInImageContainer) {
                    return // Игнорируем скролл на области изображения
                }
                
                event.preventDefault() // Prevent default scroll
                
                const now = Date.now()
                if (now - lastScrollTime < SCROLL_DELAY) {
                    return // Skip if not enough time has passed
                }
                lastScrollTime = now

                // Только переключение между блоками, без переключения изображений
                if (event.deltaY > 0 && currentIndex < sections.length - 1) { // Scrolling down
                    currentIndex = currentIndex + 1
                    scrollToSection(currentIndex)
                } else if (event.deltaY < 0 && currentIndex > 0) { // Scrolling up
                    currentIndex = currentIndex - 1
                    scrollToSection(currentIndex)
                }
            }

            // Функции для работы с формой
        const openModal = () => {
            showModal.value = true
        }

        const closeModal = () => {
            showModal.value = false
            formData.value = { name: '', phone: '', comment: '' }
            selectedCountry.value = defaultCountry
        }

        // Функция для форматирования номера телефона с учетом кода страны
        const formatPhoneNumber = (value: string, country: Country) => {
            // Удаляем все символы кроме цифр
            let phone = value.replace(/\D/g, '')
            
            // Если поле пустое, возвращаем пустую строку
            if (phone.length === 0) {
                return ''
            }
            
            // Удаляем код страны из начала, если он есть
            const countryCode = country.dialCode.replace('+', '')
            if (phone.startsWith(countryCode)) {
                phone = phone.substring(countryCode.length)
            }
            
            // Для России: если номер начинается с 8, заменяем на пустую строку (код уже есть)
            if (country.code === 'RU' && phone.startsWith('8')) {
                phone = phone.substring(1)
            }
            
            // Ограничиваем длину номера (обычно до 15 цифр для международного формата)
            // Для России максимум 10 цифр после кода +7
            const maxLength = country.code === 'RU' ? 10 : 15
            if (phone.length > maxLength) {
                phone = phone.substring(0, maxLength)
            }
            
            return phone
        }

        // Функция для отображения номера в красивом формате
        const formatPhoneDisplay = (phone: string, country: Country) => {
            // Если нет номера, возвращаем пустую строку
            if (!phone || phone.length === 0) return ''
            
            // Форматируем в зависимости от страны
            if (country.code === 'RU') {
                // Формат для России: +7 (XXX) XXX-XX-XX
                if (phone.length <= 3) return `${country.dialCode} (${phone}`
                if (phone.length <= 6) return `${country.dialCode} (${phone.slice(0, 3)}) ${phone.slice(3)}`
                if (phone.length <= 8) return `${country.dialCode} (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
                return `${country.dialCode} (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8)}`
            } else {
                // Общий формат для других стран
                return `${country.dialCode} ${phone}`
            }
        }

        // Обработчик изменения номера телефона
        const handlePhoneChange = (value: string) => {
            // Удаляем все символы кроме цифр
            const digitsOnly = value.replace(/\D/g, '')
            
            // Если нет цифр, очищаем поле
            if (digitsOnly.length === 0) {
                formData.value.phone = ''
                return
            }
            
            // Форматируем номер с учетом выбранной страны
            const formatted = formatPhoneNumber(value, selectedCountry.value)
            
            // Сохраняем отформатированный номер
            formData.value.phone = formatted
        }
        
        // Обработчик изменения страны
        const handleCountryChange = (countryCode: string) => {
            const country = countries.find(c => c.code === countryCode) || defaultCountry
            selectedCountry.value = country
            // Очищаем номер при смене страны, чтобы избежать путаницы
            formData.value.phone = ''
        }
        
        // Получаем список стран для селекта
        const countryOptions = computed(() => {
            return countries.map(country => ({
                label: `${country.flag} ${languageStore.currentLanguage === 'ru' ? country.name : country.nameEn} ${country.dialCode}`,
                value: country.code
            }))
        })

            const sendEmail = async () => {
                if (!formData.value.name.trim() || !formData.value.phone.trim()) {
                    message.error(t('app.form.fillAllFields'))
                    return
                }

                loading.value = true

                try {
                    // Создаем данные для отправки
                    const emailData = {
                        to: 'forsalenn@gmail.com',
                        subject: 'Запрос с сайта - Изготовление корпусов',
                        text: `
Новая заявка с сайта:

Имя: ${formData.value.name}
Телефон: ${selectedCountry.value.dialCode}${formData.value.phone}
Комментарий: ${formData.value.comment || 'Комментарий не указан'}
Блок: Изготовление корпусов

Дата: ${new Date().toLocaleString('ru-RU')}
                        `.trim()
                    }

                    // Отправляем письмо через EmailJS
                    const serviceId = 'service_9smwddg' // Ваш Service ID
                    const templateId = 'template_v1vpyf6' // Ваш Template ID
                    const publicKey = 'zNGFTPHDy3CmrUHlF' // Ваш Public Key

                    // Если EmailJS не настроен, используем альтернативный метод
                    try {
                        // Попытка отправить через EmailJS
                        if (typeof window.emailjs !== 'undefined') {
                            await window.emailjs.send(serviceId, templateId, {
                                to_email: emailData.to,
                                subject: emailData.subject,
                                message: emailData.text,
                                from_name: formData.value.name,
                                from_phone: `${selectedCountry.value.dialCode}${formData.value.phone}`,
                                from_comment: formData.value.comment || 'Комментарий не указан'
                            }, publicKey)
                            
                            message.success('Письмо успешно отправлено!')
                        } else {
                            throw new Error('EmailJS не подключен')
                        }
                    } catch (emailjsError) {
                        console.log('EmailJS недоступен, используем альтернативный метод')
                        
                        // Альтернативный метод - отправка через fetch к вашему API
                        const response = await fetch('/api/send-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                to: emailData.to,
                                subject: emailData.subject,
                                text: emailData.text,
                                name: formData.value.name,
                                phone: `${selectedCountry.value.dialCode}${formData.value.phone}`
                            })
                        })

                        if (response.ok) {
                            message.success('Письмо успешно отправлено!')
                        } else {
                            throw new Error('Ошибка API')
                        }
                    }

                    closeModal()
                } catch (error) {
                    console.error('Ошибка отправки:', error)
                    
                    // Fallback - показываем данные для ручной отправки
                    const fallbackMessage = `
Не удалось отправить письмо автоматически.

Данные для отправки:
Email: forsalenn@gmail.com
Тема: Запрос с сайта - Изготовление корпусов

Сообщение:
Имя: ${formData.value.name}
Телефон: ${selectedCountry.value.dialCode}${formData.value.phone}
Блок: Изготовление корпусов
Дата: ${new Date().toLocaleString('ru-RU')}

Скопируйте эти данные и отправьте вручную.
                    `
                    
                    alert(fallbackMessage)
                    message.warning('Письмо не отправлено автоматически. Данные показаны в уведомлении.')
                } finally {
                    loading.value = false
                }
            }

            return {
                handleWheel,
                showModal,
                formData,
                loading,
                openModal,
                closeModal,
                sendEmail,
                message,
                currentImageIndex,
                blockImages,
                t,
                nextImage,
                prevImage,
                getCurrentImage,
                handleImageWheel,
                showNavigation,
                toggleNavigation,
                navigateToBlock,
                formatPhoneNumber,
                formatPhoneDisplay,
                handlePhoneChange,
                selectedCountry,
                handleCountryChange,
                countryOptions,
                startAutoScroll,
                stopAutoScroll
            }
        },
        render() {
            return (
                <NLayout onWheel={this.handleWheel} class="production-layout">
                    {/* Навигация */}
                    <div class="navigation-container">
                        <NButton
                            onClick={this.toggleNavigation}
                            class="burger-button"
                        >
                            ☰
                        </NButton>
                        
                        {this.showNavigation && (
                            <div class="navigation-menu">
                                <div class="navigation-buttons">
                                    <NButton
                                        onClick={() => this.navigateToBlock('topBlock')}
                                        class="navigation-button"
                                    >
                                        {this.t('production.nav.bodies')}
                                    </NButton>
                                    <NButton
                                        onClick={() => this.navigateToBlock('nextBlock_1')}
                                        class="navigation-button"
                                    >
                                        {this.t('production.nav.belts')}
                                    </NButton>
                                    <NButton
                                        onClick={() => this.navigateToBlock('nextBlock_2')}
                                        class="navigation-button"
                                    >
                                        {this.t('production.nav.chains')}
                                    </NButton>
                                    <NButton
                                        onClick={() => this.navigateToBlock('nextBlock_3')}
                                        class="navigation-button"
                                    >
                                        {this.t('production.nav.brake')}
                                    </NButton>
                                </div>
                            </div>
                        )}
                    </div>
                    <NLayout id="topBlock" class="production-block top-block">
                        <NFlex class="production-flex">
                            <NSpace 
                                class="carousel-container"
                                data-image-container="true"
                                onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'topBlock')}
                                style={{
                                    width: '600px',
                                    height: '600px',
                                    minWidth: '600px',
                                    maxWidth: '600px',
                                    minHeight: '600px',
                                    maxHeight: '600px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}
                            >
                                <img
                                    src={this.getCurrentImage('topBlock')}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                    alt={this.t('production.stamps.title')}
                                    onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'topBlock')}
                                />
                            </NSpace>
                            <NSpace class="production-content">
                                <div class="production-text">
                                    <div class="production-title">
                                    {this.t('production.stamps.title')}
                                    </div>
                                    <p class="production-description">
                                        {this.t('production.stamps.description')}</p>
                                        <p class="production-description">
                                            
                                        </p>
                                    <NButton 
                                        type="default" 
                                        size="large"
                                        onClick={this.openModal}
                                        class="contact-button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <NIcon size={20} color="#98FB98" style={{ marginRight: '12px' }}>
                                            <LocalPhoneRound></LocalPhoneRound>
                                        </NIcon>
                                        {this.t('production.contactUs')}
                                    </NButton>
                                </div>
                            </NSpace>
                        </NFlex>
                    </NLayout>
                    <NLayout id="nextBlock_1" class="production-block next-block-1">
                        <NFlex class="production-flex">
                            <NSpace 
                                class="carousel-container"
                                data-image-container="true"
                                onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'nextBlock_1')}
                                style={{
                                    width: '600px',
                                    height: '600px',
                                    minWidth: '600px',
                                    maxWidth: '600px',
                                    minHeight: '600px',
                                    maxHeight: '600px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}
                            >
                                <img
                                    src={this.getCurrentImage('nextBlock_1')}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                    alt={this.t('production.belt.title')}
                                    onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'nextBlock_1')}
                                />
                            </NSpace>
                            <NSpace class="production-content">
                                <div class="production-text">
                                    <div class="production-title">
                                        {this.t('production.belt.title')}
                                    </div>
                                    <p class="production-description">
                                        {this.t('production.belt.description')}
                                    </p>
                                    <NButton 
                                        type="default" 
                                        size="large"
                                        onClick={this.openModal}
                                        class="contact-button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <NIcon size={20} color="#98FB98" style={{ marginRight: '12px' }}>
                                            <LocalPhoneRound></LocalPhoneRound>
                                        </NIcon>
                                        {this.t('production.contactUs')}
                                    </NButton>
                                </div>
                            </NSpace>
                        </NFlex>
                    </NLayout>
                    <NLayout id="nextBlock_2" class="production-block next-block-2">
                        <NFlex class="production-flex">
                            <NSpace 
                                class="carousel-container"
                                data-image-container="true"
                                onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'nextBlock_2')}
                                style={{
                                    width: '600px',
                                    height: '600px',
                                    minWidth: '600px',
                                    maxWidth: '600px',
                                    minHeight: '600px',
                                    maxHeight: '600px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}
                            >
                                <img
                                    src={this.getCurrentImage('nextBlock_2')}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                    alt={this.t('production.chain.title')}
                                    onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'nextBlock_2')}
                                />
                            </NSpace>
                            <NSpace class="production-content">
                                <div class="production-text">
                                    <div class="production-title">
                                        {this.t('production.chain.title')}
                                    </div>
                                    <p class="production-description">
                                        {this.t('production.chain.description')}
                                    </p>
                                    <NButton 
                                        type="default" 
                                        size="large"
                                        onClick={this.openModal}
                                        class="contact-button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <NIcon size={20} color="#98FB98" style={{ marginRight: '12px' }}>
                                            <LocalPhoneRound></LocalPhoneRound>
                                        </NIcon>
                                        {this.t('production.contactUs')}
                                    </NButton>
                                </div>
                            </NSpace>
                        </NFlex>
                    </NLayout>
                    <NLayout id="nextBlock_3" class="production-block next-block-3">
                        <NFlex class="production-flex">
                            <NSpace 
                                class="carousel-container"
                                data-image-container="true"
                                onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'nextBlock_3')}
                                style={{
                                    width: '600px',
                                    height: '600px',
                                    minWidth: '600px',
                                    maxWidth: '600px',
                                    minHeight: '600px',
                                    maxHeight: '600px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}
                            >
                                <img
                                    src={this.getCurrentImage('nextBlock_3')}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                    alt={this.t('production.brake.title')}
                                    onWheel={(e: WheelEvent) => this.handleImageWheel(e, 'nextBlock_3')}
                                />
                            </NSpace>
                            <NSpace class="production-content">
                                <div class="production-text">
                                    <div class="production-title">
                                        {this.t('production.brake.title')}
                                    </div>
                                    <p class="production-description">
                                        {this.t('production.brake.description')}
                                    </p>
                                    <NButton 
                                        type="default" 
                                        size="large"
                                        onClick={this.openModal}
                                        class="contact-button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <NIcon size={20} color="#98FB98" style={{ marginRight: '12px' }}>
                                            <LocalPhoneRound></LocalPhoneRound>
                                        </NIcon>
                                        {this.t('production.contactUs')}
                                    </NButton>
                                </div>
                            </NSpace>
                        </NFlex>
                    </NLayout>

                    {/* Модальное окно с формой */}
                    <NModal
                        show={this.showModal}
                        onUpdate:show={(value: boolean) => this.showModal = value}
                        preset="card"
                        title={this.t('production.contactUs')}
                        size="medium"
                        style={{
                            backgroundColor: '#2d2d2d', 
                            border: '1px solid #404040',
                            maxWidth: '50vw',
                            width: '50%',
                            minWidth: '300px'
                        }}
                        onClose={this.closeModal}
                    >
                        <NForm
                            model={this.formData}
                            style={{padding: '20px 0'}}
                        >
                            <NFormItem label={this.t('app.form.name')} path="name">
                                <NInput
                                    value={this.formData.name}
                                    onUpdateValue={(value: string) => this.formData.name = value}
                                    placeholder={this.t('app.form.namePlaceholder')}
                                    size="large"
                                    style={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #404040',
                                        color: '#ffffff'
                                    }}
                                />
                            </NFormItem>
                            
                            <NFormItem label={this.t('app.form.phone')} path="phone">
                                <NFlex style={{gap: '10px'}}>
                                    <NSelect
                                        value={this.selectedCountry.code}
                                        onUpdateValue={this.handleCountryChange}
                                        options={this.countryOptions}
                                        style={{
                                            width: '200px',
                                            flexShrink: 0
                                        }}
                                        size="large"
                                    />
                                    <NInput
                                        value={this.formatPhoneDisplay(this.formData.phone, this.selectedCountry)}
                                        onUpdateValue={this.handlePhoneChange}
                                        placeholder={this.selectedCountry.code === 'RU' ? '+7 (___) ___-__-__' : `${this.selectedCountry.dialCode} ___________`}
                                        size="large"
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #404040',
                                            color: '#ffffff'
                                        }}
                                    />
                                </NFlex>
                            </NFormItem>
                            
                            <NFormItem label={this.t('app.form.comment')} path="comment">
                                <NInput
                                    value={this.formData.comment}
                                    onUpdateValue={(value: string) => this.formData.comment = value}
                                    placeholder="Опишите ваш запрос (необязательно)"
                                    size="large"
                                    type="textarea"
                                    rows={3}
                                    style={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #404040',
                                        color: '#ffffff'
                                    }}
                                />
                            </NFormItem>
                            
                            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                                <NButton 
                                    onClick={this.closeModal}
                                    style={{
                                        backgroundColor: '#404040',
                                        border: '1px solid #666666',
                                        color: '#ffffff'
                                    }}
                                >
                                    Отмена
                                </NButton>
                                <NButton 
                                    type="primary"
                                    loading={this.loading}
                                    onClick={this.sendEmail}
                                    style={{
                                        backgroundColor: '#4dabf7',
                                        border: '1px solid #4dabf7',
                                        color: '#ffffff'
                                    }}
                                >
                                    {this.t('common.send')}
                                </NButton>
                            </div>
                        </NForm>
                    </NModal>
                </NLayout>
            )
        }
    }
)
export default ProductionView