import {
    NLayout,
    NButton,
    NFlex,
    NSpace,
    NImage,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NText,
    NSelect,
    NIcon,
    useMessage
} from 'naive-ui'
import {defineComponent, ref, computed, watch} from "vue";
import { LocalPhoneRound } from '@vicons/material'
import { useTranslation } from "../../utils/translations";
import { useLanguageStore } from "../../stores/languageStore";
import { countries, defaultCountry, type Country } from "../../utils/countries";

// Типы для EmailJS
declare global {
    interface Window {
        emailjs: {
            send: (serviceId: string, templateId: string, templateParams: any, publicKey: string) => Promise<any>
        }
    }
}


const AppView = defineComponent({
        setup() {
            const { t } = useTranslation()
            const languageStore = useLanguageStore()
            const showNavigation = ref(false)
            const hoveredCategory = ref<string | null>(null)
            const selectedCategory = ref<string | null>(null)
            const hideTimeouts: { [key: string]: ReturnType<typeof setTimeout> | null } = {}
            const showImageModal = ref(false)
            const selectedImageUrl = ref<string | null>(null)
            
            const clearHideTimeout = (categoryKey: string) => {
                if (hideTimeouts[categoryKey]) {
                    clearTimeout(hideTimeouts[categoryKey]!)
                    hideTimeouts[categoryKey] = null
                }
            }
            
            const setHideTimeout = (categoryKey: string, callback: () => void, delay: number) => {
                clearHideTimeout(categoryKey)
                hideTimeouts[categoryKey] = setTimeout(() => {
                    callback()
                    hideTimeouts[categoryKey] = null
                }, delay)
            }
            const showModal = ref(false)
            const selectedCountry = ref<Country>(defaultCountry)
            const formData = ref({
                name: '',
                phone: '',
                comment: ''
            })
            const loading = ref(false)
            const message = useMessage()
            let currentSectionIndex = 0
            let lastScrollTime = 0
            const SCROLL_DELAY = 500 // 500ms delay
            const currentSubCategoryKey = ref<string | null>(null)

            // Массивы изображений для каждой подкатегории
            const subCategoryImages = computed(() => {
                const isEnglish = languageStore.currentLanguage === 'en'
                return {
                    'surron-belts': [
                        "src/assets/img/apppage/beltkit/2.jpg",
                        "src/assets/img/apppage/beltkit/1.jpg",
                        "src/assets/img/apppage/beltkit/3.jpg"
                    ],
                    'surron-suspension': [
                        "src/assets/img/apppage/mayatnik/1.png",
                        isEnglish ? "src/assets/img/apppage/mayatnik/2_en.png" : "src/assets/img/apppage/mayatnik/2.png",
                        "src/assets/img/apppage/mayatnik/3.png",
                        "src/assets/img/apppage/mayatnik/4.png"
                    ]
                }
            })

            // Состояние для карусели изображений
            const currentImageIndex = ref({
                'surron-belts': 0,
                'surron-suspension': 0
            })

            // Функции для управления каруселью
            const nextImage = (subCategoryKey: string) => {
                const currentIndex = currentImageIndex.value[subCategoryKey as keyof typeof currentImageIndex.value]
                const maxIndex = subCategoryImages.value[subCategoryKey as keyof typeof subCategoryImages.value].length - 1
                currentImageIndex.value[subCategoryKey as keyof typeof currentImageIndex.value] = 
                    currentIndex >= maxIndex ? 0 : currentIndex + 1
            }

            const prevImage = (subCategoryKey: string) => {
                const currentIndex = currentImageIndex.value[subCategoryKey as keyof typeof currentImageIndex.value]
                const maxIndex = subCategoryImages.value[subCategoryKey as keyof typeof subCategoryImages.value].length - 1
                currentImageIndex.value[subCategoryKey as keyof typeof currentImageIndex.value] = 
                    currentIndex <= 0 ? maxIndex : currentIndex - 1
            }

            const getCurrentImage = (subCategoryKey: string) => {
                const index = currentImageIndex.value[subCategoryKey as keyof typeof currentImageIndex.value]
                return subCategoryImages.value[subCategoryKey as keyof typeof subCategoryImages.value][index]
            }

            // Состояние для задержки переключения картинок
            let lastImageScrollTime = 0
            const IMAGE_SCROLL_DELAY = 300 // 300ms delay для переключения картинок

            // Обработчик скролла для переключения картинок
            const handleImageWheel = (event: WheelEvent, subCategoryKey: string) => {
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
                    nextImage(subCategoryKey)
                } else if (event.deltaY < 0) { // Scrolling up - предыдущая картинка
                    prevImage(subCategoryKey)
                }
            }
            
            // Категории для меню - используем computed для реактивности переводов
            const categories = computed(() => {
                const currentLang = languageStore.currentLanguage
                return [
                    {
                        label: t('app.surron'),
                        key: 'surron',
                        icon: '🏍️',
                        submenu: [
                            {
                                label: t('app.beltDrive'),
                                key: 'surron-belts'
                            },
                            {
                                label: t('app.suspension'),
                                key: 'surron-suspension'
                            }
                        ]
                    },
                    {
                        label: t('app.talaria'),
                        key: 'talaria',
                        icon: '⚡'
                    }
                ]
            })

            const toggleNavigation = () => {
                showNavigation.value = !showNavigation.value
            }

            const handleCategorySelect = (key: string) => {
                const category = categories.value.find(c => c.key === key)
                if (category && category.submenu && category.submenu.length > 0) {
                    selectedCategory.value = key
                }
                showNavigation.value = false
            }

            const handleSubCategorySelect = (categoryKey: string, subCategoryKey: string) => {
                showNavigation.value = false
                hoveredCategory.value = null
                
                // Устанавливаем выбранную категорию
                selectedCategory.value = categoryKey
                
                // Небольшая задержка, чтобы subCategories обновились
                setTimeout(() => {
                    // Находим индекс выбранной подкатегории
                    const sectionKeys = subCategories.value.map(sub => sub.key)
                    const sectionIndex = sectionKeys.indexOf(subCategoryKey)
                    
                    if (sectionIndex !== -1) {
                        currentSectionIndex = sectionIndex
                        currentSubCategoryKey.value = subCategoryKey
                        scrollToSection(sectionIndex)
                    }
                }, 0)
            }

            // Получаем первую категорию с подкатегориями для автоматического отображения
            const defaultCategory = computed(() => {
                if (selectedCategory.value) {
                    return categories.value.find(c => c.key === selectedCategory.value) || null
                }
                return categories.value.find(c => c.submenu && c.submenu.length > 0) || null
            })
            
            // Инициализация выбранной категории при загрузке
            if (!selectedCategory.value) {
                const firstCategoryWithSubmenu = categories.value.find(c => c.submenu && c.submenu.length > 0)
                if (firstCategoryWithSubmenu) {
                    selectedCategory.value = firstCategoryWithSubmenu.key
                    // Устанавливаем первую подкатегорию как текущую
                    if (firstCategoryWithSubmenu.submenu && firstCategoryWithSubmenu.submenu.length > 0) {
                        currentSubCategoryKey.value = firstCategoryWithSubmenu.submenu[0].key
                    }
                }
            }

            // Получаем все подкатегории для отображения секций
            const subCategories = computed(() => {
                if (defaultCategory.value && defaultCategory.value.submenu) {
                    return defaultCategory.value.submenu || []
                }
                return []
            })

            // Автоматически устанавливаем первую подкатегорию при изменении списка подкатегорий
            watch(subCategories, (newSubCategories) => {
                if (newSubCategories.length > 0 && !currentSubCategoryKey.value) {
                    currentSubCategoryKey.value = newSubCategories[0].key
                }
            }, { immediate: true })

            // Массив цветов для секций
            const sectionColors = [
                '#2d2d2d',  // Темно-серый
                '#1f1e1e',  // Серый
               
            ]

            // Получить цвет для секции по индексу
            const getSectionColor = (index: number) => {
                return sectionColors[index % sectionColors.length]
            }

            // Получаем ключи секций для навигации
            const getSectionKeys = () => {
                return subCategories.value.map(sub => sub.key)
            }

            // Прокрутка к секции по индексу
            const scrollToSection = (index: number): void => {
                const sections = getSectionKeys()
                if (sections.length === 0) return
                
                const element = document.getElementById(sections[index])
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    })
                    currentSectionIndex = index
                    // Обновляем текущую подкатегорию
                    if (sections[index]) {
                        currentSubCategoryKey.value = sections[index]
                    }
                }
            }

            // Обработчик скролла для навигации по секциям
            const handleWheel = (event: WheelEvent): void => {
                if (subCategories.value.length === 0) return
                
                // Проверяем, не пришло ли событие из области изображения
                const target = event.target as HTMLElement
                
                // Если событие пришло из контейнера изображения или его дочерних элементов, игнорируем его
                if (target) {
                    const imageContainer = target.closest('[data-image-container]')
                    if (imageContainer) {
                        return // Игнорируем скролл на области изображения
                    }
                    
                    // Также проверяем, является ли target изображением или его частью
                    if (target.tagName === 'IMG' || target.closest('.n-image') || target.closest('img')) {
                        return
                    }
                }
                
                event.preventDefault() // Prevent default scroll
                event.stopPropagation() // Stop event bubbling
                
                const now = Date.now()
                if (now - lastScrollTime < SCROLL_DELAY) {
                    return // Skip if not enough time has passed
                }
                lastScrollTime = now

                // Переключение между секциями при скролле
                if (event.deltaY > 0 && currentSectionIndex < subCategories.value.length - 1) { // Scrolling down
                    currentSectionIndex = currentSectionIndex + 1
                    const sections = getSectionKeys()
                    if (sections[currentSectionIndex]) {
                        currentSubCategoryKey.value = sections[currentSectionIndex]
                    }
                    scrollToSection(currentSectionIndex)
                } else if (event.deltaY < 0 && currentSectionIndex > 0) { // Scrolling up
                    currentSectionIndex = currentSectionIndex - 1
                    const sections = getSectionKeys()
                    if (sections[currentSectionIndex]) {
                        currentSubCategoryKey.value = sections[currentSectionIndex]
                    }
                    scrollToSection(currentSectionIndex)
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

            const formatPhoneNumber = (value: string, country: Country) => {
                let phone = value.replace(/\D/g, '')
                if (phone.length === 0) return ''
                
                // Удаляем код страны из начала, если он есть
                const countryCode = country.dialCode.replace('+', '')
                if (phone.startsWith(countryCode)) {
                    phone = phone.substring(countryCode.length)
                }
                
                // Для России: если номер начинается с 8, заменяем на пустую строку
                if (country.code === 'RU' && phone.startsWith('8')) {
                    phone = phone.substring(1)
                }
                
                // Ограничиваем длину номера
                const maxLength = country.code === 'RU' ? 10 : 15
                if (phone.length > maxLength) {
                    phone = phone.substring(0, maxLength)
                }
                
                return phone
            }

            const formatPhoneDisplay = (phone: string, country: Country) => {
                if (!phone || phone.length === 0) return ''
                
                if (country.code === 'RU') {
                    // Формат для России: +7 (XXX) XXX-XX-XX
                    if (phone.length <= 3) return `${country.dialCode} (${phone}`
                    if (phone.length <= 6) return `${country.dialCode} (${phone.slice(0, 3)}) ${phone.slice(3)}`
                    if (phone.length <= 8) return `${country.dialCode} (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
                    return `${country.dialCode} (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8)}`
                } else {
                    return `${country.dialCode} ${phone}`
                }
            }

            const handlePhoneChange = (value: string) => {
                const digitsOnly = value.replace(/\D/g, '')
                if (digitsOnly.length === 0) {
                    formData.value.phone = ''
                    return
                }
                const formatted = formatPhoneNumber(value, selectedCountry.value)
                formData.value.phone = formatted
            }
            
            const handleCountryChange = (countryCode: string) => {
                const country = countries.find(c => c.code === countryCode) || defaultCountry
                selectedCountry.value = country
                formData.value.phone = ''
            }
            
            const countryOptions = computed(() => {
                return countries.map(country => ({
                    label: `${country.flag} ${languageStore.currentLanguage === 'ru' ? country.name : country.nameEn} ${country.dialCode}`,
                    value: country.code
                }))
            })

            const sendEmail = async () => {
                // Проверка имени
                if (!formData.value.name.trim()) {
                    message.error(t('app.form.nameRequired'))
                    return
                }

                // Проверка телефона
                if (!formData.value.phone.trim()) {
                    message.error(t('app.form.phoneRequired'))
                    return
                }

                // Проверка валидности номера телефона
                const phoneDigits = formData.value.phone.replace(/\D/g, '')
                if (selectedCountry.value.code === 'RU') {
                    // Для России должно быть 10 цифр
                    if (phoneDigits.length !== 10) {
                        message.error(t('app.form.phoneInvalid'))
                        return
                    }
                } else {
                    // Для других стран минимум 5 цифр
                    if (phoneDigits.length < 5) {
                        message.error(t('app.form.phoneInvalid'))
                        return
                    }
                }

                // Проверка комментария
                if (!formData.value.comment.trim()) {
                    message.error(t('app.form.commentRequired'))
                    return
                }

                // Определяем название раздела
                let sectionName = 'Товары' // По умолчанию
                if (currentSubCategoryKey.value) {
                    if (currentSubCategoryKey.value === 'surron-belts') {
                        sectionName = t('app.beltDrive')
                    } else if (currentSubCategoryKey.value === 'surron-suspension') {
                        sectionName = t('app.suspension')
                    }
                }

                loading.value = true

                try {
                    // Создаем данные для отправки
                    const emailData = {
                        to: 'forsalenn@gmail.com',
                        subject: `Запрос с сайта - ${sectionName}`,
                        text: `
Новая заявка с сайта:

Имя: ${formData.value.name}
Телефон: ${selectedCountry.value.dialCode}${formData.value.phone}
Комментарий: ${formData.value.comment || 'Комментарий не указан'}
Раздел: ${sectionName}

Дата: ${new Date().toLocaleString('ru-RU')}
                        `.trim()
                    }

                    // Отправляем письмо через EmailJS
                    const serviceId = 'service_9smwddg'
                    const templateId = 'template_v1vpyf6'
                    const publicKey = 'zNGFTPHDy3CmrUHlF'

                    // Проверяем доступность EmailJS
                    if (typeof window !== 'undefined' && typeof (window as any).emailjs !== 'undefined') {
                        await (window as any).emailjs.send(serviceId, templateId, {
                            to_email: emailData.to,
                            subject: emailData.subject,
                            message: emailData.text,
                            from_name: formData.value.name,
                            from_phone: `${selectedCountry.value.dialCode}${formData.value.phone}`,
                            from_comment: formData.value.comment || 'Комментарий не указан'
                        }, publicKey)
                        
                        message.success(t('app.form.success'))
                        closeModal()
                    } else {
                        // Альтернативный метод - отправка через fetch к API
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
                            message.success(t('app.form.success'))
                            closeModal()
                        } else {
                            throw new Error('Ошибка API')
                        }
                    }
                } catch (error) {
                    console.error('Ошибка отправки:', error)
                    message.error(t('app.form.error'))
                } finally {
                    loading.value = false
                }
            }

            return {
                categories,
                showNavigation,
                hoveredCategory,
                selectedCategory,
                clearHideTimeout,
                setHideTimeout,
                subCategories,
                getSectionColor,
                handleWheel,
                showModal,
                formData,
                loading,
                currentImageIndex,
                nextImage,
                prevImage,
                getCurrentImage,
                handleImageWheel,
                t,
                openModal,
                closeModal,
                formatPhoneDisplay,
                handlePhoneChange,
                selectedCountry,
                handleCountryChange,
                countryOptions,
                sendEmail,
                toggleNavigation,
                handleCategorySelect,
                handleSubCategorySelect,
                getSectionKeys,
                scrollToSection
            }
        },
        render() {
            return (
                <NLayout 
                    style={{
                        height: '100vh',
                        maxHeight: '100vh',
                        background: '#1a1a1a',
                        overflow: 'hidden',
                        boxSizing: 'border-box'
                    }} 
                    class="production-layout"
                    onWheel={this.handleWheel}
                >
                    {/* Навигация */}
                    <NSpace class="navigation-container">
                        <NButton
                            onClick={(e: MouseEvent) => {
                                e.stopPropagation()
                                this.toggleNavigation()
                            }}
                            class="burger-button"
                        >
                            ☰
                        </NButton>
                        
                        {this.showNavigation && (
                            <NSpace 
                                class="navigation-menu"
                                onClick={(e: MouseEvent) => e.stopPropagation()}
                            >
                                <NSpace vertical class="navigation-buttons">
                                    {this.categories.map((category: any) => (
                                        <NSpace
                                            key={category.key}
                                            style={{position: 'relative'}}
                                            onMouseenter={() => {
                                                // Отменяем таймаут скрытия, если он есть
                                                this.clearHideTimeout(category.key)
                                                if (category.submenu) {
                                                    this.hoveredCategory = category.key
                                                }
                                            }}
                                            onMouseleave={() => {
                                                // Добавляем задержку перед скрытием, чтобы дать время переместиться в подменю
                                                if (category.submenu) {
                                                    this.setHideTimeout(category.key, () => {
                                                        if (this.hoveredCategory === category.key) {
                                                            this.hoveredCategory = null
                                                        }
                                                    }, 300)
                                                } else {
                                                    this.hoveredCategory = null
                                                }
                                            }}
                                        >
                                            <NButton
                                                onClick={() => this.handleCategorySelect(category.key)}
                                                class="navigation-button"
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'flex-start'
                                                }}
                                            >
                                                <NText style={{marginRight: '10px', fontSize: '18px'}}>{category.icon}</NText>
                                                {category.label}
                                                {category.submenu && (
                                                    <NText style={{marginLeft: 'auto', fontSize: '14px'}}>▶</NText>
                                                )}
                                            </NButton>
                                            {category.submenu && this.hoveredCategory === category.key && (
                                                <NSpace 
                                                    vertical
                                                    onMouseenter={() => {
                                                        // Отменяем таймаут скрытия при наведении на подменю
                                                        this.clearHideTimeout(category.key)
                                                        this.hoveredCategory = category.key
                                                    }}
                                                    onMouseleave={() => {
                                                        // Скрываем подменю при уходе мыши
                                                        this.hoveredCategory = null
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '100%',
                                                        top: 0,
                                                        marginLeft: '2px',
                                                        background: 'rgba(0, 0, 0, 0.8)',
                                                        backdropFilter: 'blur(15px)',
                                                        borderRadius: '8px',
                                                        padding: '8px',
                                                        minWidth: '200px',
                                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                                        zIndex: 1000
                                                    }}
                                                >
                                                    {category.submenu.map((subItem: any) => (
                                                        <NButton
                                                            key={subItem.key}
                                                            onClick={() => this.handleSubCategorySelect(category.key, subItem.key)}
                                                            class="navigation-button"
                                                            style={{
                                                                width: '100%',
                                                                justifyContent: 'flex-start',
                                                                marginBottom: '4px'
                                                            }}
                                                        >
                                                            {subItem.label}
                                                        </NButton>
                                                    ))}
                                                </NSpace>
                                            )}
                                        </NSpace>
                                    ))}
                                </NSpace>
                            </NSpace>
                        )}
                    </NSpace>
                        {this.subCategories.length > 0 ? (
                            // Отображение секций для каждой подкатегории
                            this.subCategories.map((subCategory, index) => (
                                <NLayout 
                                    key={subCategory.key}
                                    id={subCategory.key}
                                    style={{
                                        background: this.getSectionColor(index),
                                        height: '100vh',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <NFlex style={{
                                        maxWidth: '1400px',
                                        width: '100%',
                                        height: '100%',
                                        padding: '0 20px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '40px',
                                        overflow: 'hidden',
                                        boxSizing: 'border-box',
                                        flexWrap: 'nowrap'
                                    }}>
                                        {/* Изображение слева */}
                                        <NSpace
                                            data-image-container="true"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '600px',
                                                height: '600px',
                                                minWidth: '600px',
                                                maxWidth: '600px',
                                                minHeight: '600px',
                                                maxHeight: '600px',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}
                                        >
                                            <NSpace
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    maxWidth: '600px',
                                                    maxHeight: '600px',
                                                    minWidth: '600px',
                                                    minHeight: '600px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                                onWheel={(e: WheelEvent) => this.handleImageWheel(e, subCategory.key)}
                                            >
                                                <img 
                                                    src={this.getCurrentImage(subCategory.key)} 
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain',
                                                        display: 'block',
                                                        margin: 'auto'
                                                    }}
                                                    alt={subCategory.label}
                                                />
                                            </NSpace>
                                        </NSpace>
                                        
                                        {/* Текст справа */}
                                        <NSpace style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flex: 1,
                                            height: '100%'
                                        }}>
                                            <NSpace vertical style={{
                                                textAlign: 'center',
                                                color: '#e0e0e0',
                                                lineHeight: '1.6'
                                            }}>
                                                <NText style={{
                                                    fontSize: '32px',
                                                    fontWeight: 'bold',
                                                    color: '#4dabf7',
                                                    marginBottom: '20px',
                                                    display: 'block'
                                                }}>
                                                    {subCategory.label}
                                                </NText>
                                                <NText style={{fontSize: '18px', marginBottom: '30px', display: 'block', whiteSpace: 'pre-line'}}>
                                                    {subCategory.key === 'surron-belts' 
                                                        ? this.t('app.surronBelts.description')
                                                        : this.t('app.surronSuspension.description')
                                                    }
                                                </NText>
                                                <NButton 
                                                    type="default" 
                                                    size="large"
                                                    onClick={this.openModal}
                                                    style={{
                                                        fontSize: '18px',
                                                        padding: '12px 30px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#1a1a1a',
                                                        border: '2px solid #404040',
                                                        color: '#ffffff',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto'
                                                    }}
                                                >
                                                    <NIcon size={20} color="#98FB98" style={{ marginRight: '12px' }}>
                                                        <LocalPhoneRound></LocalPhoneRound>
                                                    </NIcon>
                                                    {this.t('app.contactUs')}
                                                </NButton>
                                            </NSpace>
                                        </NSpace>
                                    </NFlex>
                                </NLayout>
                            ))
                        ) : null}
                        
                    {/* Модальное окно с формой */}
                        <NModal
                            show={this.showModal}
                            onUpdate:show={(value: boolean) => this.showModal = value}
                            preset="card"
                            title={this.t('app.contactUs')}
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
                                        placeholder="Введите ваше имя"
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
                                            class="country-select-no-border"
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
                                
                                <NFormItem label="Комментарий" path="comment">
                                    <NInput
                                        value={this.formData.comment}
                                        onUpdateValue={(value: string) => this.formData.comment = value}
                                        placeholder={this.t('app.form.commentPlaceholder')}
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
                                
                                <NSpace style={{justifyContent: 'flex-end', marginTop: '20px'}}>
                                    <NButton 
                                        onClick={this.closeModal}
                                        style={{
                                            backgroundColor: '#404040',
                                            border: '1px solid #666666',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {this.t('common.cancel')}
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
                                        Отправить
                                    </NButton>
                                </NSpace>
                            </NForm>
                        </NModal>
                </NLayout>
            )
        }
    }
)
export default AppView
