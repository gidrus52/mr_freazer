import { Language, useLanguageStore } from '../stores/languageStore'
import { computed } from 'vue'

export type TranslationKey = 
  // Navigation
  | 'nav.home' | 'nav.ourServices' | 'nav.ourProducts' | 'nav.login'
  // Main page
  | 'main.companyName' | 'main.heroSubtitle' | 'main.address' | 'main.city' | 'main.workDays' | 'main.workHours' | 'main.phone1' | 'main.phone2'
  | 'main.milling' | 'main.millingDesc' | 'main.turning' | 'main.turningDesc'
  | 'main.welding' | 'main.weldingDesc' | 'main.cutting' | 'main.cuttingDesc'
  | 'main.telegram' | 'main.email'
  // Production page
  | 'production.stamps.title' | 'production.stamps.description'
  | 'production.pressforms.title' | 'production.pressforms.description'
  | 'production.bodies.title' | 'production.bodies.description'
  | 'production.brake.title' | 'production.brake.description'
  | 'production.belt.title' | 'production.belt.description'
  | 'production.chain.title' | 'production.chain.description'
  | 'production.milling.title' | 'production.milling.description'
  | 'production.orderButton' | 'production.contactUs'
  | 'production.nav.bodies' | 'production.nav.belts' | 'production.nav.chains' | 'production.nav.brake' | 'production.nav.milling'
  // Login page
  | 'login.welcome' | 'login.tabLogin' | 'login.tabRegister' | 'login.email' | 'login.password'
  | 'login.emailPlaceholder' | 'login.passwordPlaceholder' | 'login.loginButton' | 'login.registerButton'
  | 'login.name' | 'login.namePlaceholder' | 'login.confirmPassword' | 'login.confirmPasswordPlaceholder'
  | 'login.testConnection' | 'login.footerText'
  // User cabinet
  | 'cabinet.welcome' | 'cabinet.email' | 'cabinet.name' | 'cabinet.id' | 'cabinet.role' | 'cabinet.roleAdmin' | 'cabinet.roleUser'
  | 'cabinet.actions' | 'cabinet.logout' | 'cabinet.title' | 'cabinet.profile' | 'cabinet.orders' | 'cabinet.adminPanel'
  | 'cabinet.accessDenied' | 'cabinet.info'
  // App page (Products)
  | 'app.companyName' | 'app.surron' | 'app.talaria' | 'app.beltDrive' | 'app.suspension'
  | 'app.surronBelts.description' | 'app.surronSuspension.description' | 'app.contactUs'
  | 'app.form.name' | 'app.form.namePlaceholder' | 'app.form.phone' | 'app.form.comment' | 'app.form.commentPlaceholder'
  | 'app.form.fillAllFields' | 'app.form.success' | 'app.form.error'
  | 'app.form.nameRequired' | 'app.form.phoneRequired' | 'app.form.phoneInvalid' | 'app.form.commentRequired'
  // Common
  | 'common.order' | 'common.send' | 'common.cancel' | 'common.close'

export const translations: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    // Navigation
    'nav.home': 'На главную',
    'nav.ourServices': 'Наши услуги',
    'nav.ourProducts': 'Наши товары',
    'nav.login': 'Войти',
    // Main page
    'main.companyName': 'МИСТЕР ФРЕЗЕР',
    'main.heroSubtitle': 'Профессиональные услуги по металлообработке',
    'main.telegram': 'Telegram',
    'main.email': 'Email',
    'main.address': 'улица Шекспира, 1"Ж"',
    'main.city': 'Нижний Новгород',
    'main.workDays': 'Пн-Пт',
    'main.workHours': 'с 9-00 до 18-30',
    'main.phone1': '+7 (495) 728-5000',
    'main.phone2': '+7 (495) 728-6000',
    'main.milling': 'Фрезерная обработка',
    'main.millingDesc': 'Универсалльное и чпу оборудование',
    'main.turning': 'Токарная обработка',
    'main.turningDesc': 'Универсалльное и чпу оборудование',
    'main.welding': 'Сварка',
    'main.weldingDesc': 'Черные и цветные металлы',
    'main.cutting': 'Распил металла',
    'main.cuttingDesc': 'Черные и цветные металлы',
    // Production page
    'production.stamps.title': 'Штампы. Пресформы. Корпуса. ',
    'production.stamps.description': 'Профессиональные услуги по изготовлению корпусов из конструкционных, инструментальных сталей, а также алюминия на современных станках. Фрезерная и токарная обработки общего назначения',
    'production.pressforms.title': 'Пресформы',
    'production.pressforms.description': 'Изготовление пресформ для различных отраслей промышленности.',
    'production.bodies.title': 'Корпуса',
    'production.bodies.description': 'Производство корпусов различной сложности.',
    'production.brake.title': 'Тормозная система',
    'production.brake.description': 'Нанесения любых слотов и перфорации в зависимости от Ваших желаний. Проточка тормозных дисков, перфорация и слотирование. Изготовление статоров к роторным тормозным системам.',
    'production.belt.title': 'Ременные передачи',
    'production.belt.description': 'Современное оборудование и высококвалифицированные специалисты. Ременные передачи для приводов конвейеров, станков, электромотоциклов, мотоциклов с двс.',
    'production.chain.title': 'Цепные передачи',
    'production.chain.description': 'Современное оборудование и высококвалифицированные специалисты. Цепные передачи для приводов конвейеров, станков, электромотоциклов, мотоциклов с двс. Увеличенные и нестандартные звезды для стантрайдинга.',
    'production.milling.title': 'Фрезерная и токарная обработки',
    'production.milling.description': 'Фрезерная и токарная обработки общего назначения. Плсастик и металлы',
    'production.orderButton': 'Заказать',
    'production.contactUs': 'Свяжитесь с нами',
    'production.nav.bodies': 'Корпуса и пресс-формы',
    'production.nav.belts': 'Ременные передачи',
    'production.nav.chains': 'Цепные передачи',
    'production.nav.brake': 'Тормозная система',
    'production.nav.milling': 'Фрезерная и токарная обработки',
    // Login page
    'login.welcome': 'Добро пожаловать',
    'login.tabLogin': 'Вход',
    'login.tabRegister': 'Регистрация',
    'login.email': 'Email',
    'login.password': 'Пароль',
    'login.emailPlaceholder': 'Введите email',
    'login.passwordPlaceholder': 'Введите пароль',
    'login.loginButton': 'Войти',
    'login.registerButton': 'Зарегистрироваться',
    'login.name': 'Имя',
    'login.namePlaceholder': 'Введите ваше имя',
    'login.confirmPassword': 'Подтвердите пароль',
    'login.confirmPasswordPlaceholder': 'Повторите пароль',
    'login.testConnection': 'Проверить подключение к серверу',
    'login.footerText': 'Войдите в систему или создайте новый аккаунт',
    // User cabinet
    'cabinet.welcome': 'Добро пожаловать!',
    'cabinet.email': 'Email',
    'cabinet.name': 'Имя',
    'cabinet.id': 'ID',
    'cabinet.role': 'Роль',
    'cabinet.roleAdmin': 'Администратор',
    'cabinet.roleUser': 'Пользователь',
    'cabinet.actions': 'Действия:',
    'cabinet.logout': 'Выйти',
    'cabinet.title': 'Мой кабинет',
    'cabinet.profile': 'Профиль',
    'cabinet.orders': 'Мои заказы',
    'cabinet.adminPanel': 'Админ панель',
    'cabinet.accessDenied': 'Для доступа к личному кабинету необходимо войти в систему.',
    'cabinet.info': 'Здесь вы можете управлять своим профилем и настройками.',
    // App page (Products)
    'app.companyName': 'Мистер фрезер',
    'app.surron': 'Сууррон',
    'app.talaria': 'Талария',
    'app.beltDrive': 'Ременная передача',
    'app.suspension': 'Маятник',
    'app.surronBelts.description': 'Ременные передачи для Сууррон Ultra Bee и Light Bee. Шаги ремней 8мм и 14мм. Комплекты сремнями "SIT", "MEGADYNE", "CONTITECH".  Высококачественные компоненты для надежной работы вашего электромотоцикла.Стальные компоненты - сталь 40Х, алюминиевые компонеты - сплав В95Т или 7075',
    'app.surronSuspension.description': 'Усиленный удлиненный и стандартный маятники для Суррон Ультра БИ и Лайт БИ.',
    'app.contactUs': 'Свяжитесь с нами',
    'app.form.name': 'Ваше имя',
    'app.form.namePlaceholder': 'Введите ваше имя',
    'app.form.phone': 'Телефон',
    'app.form.comment': 'Комментарий',
    'app.form.commentPlaceholder': 'Опишите Ваш запрос',
    'app.form.fillAllFields': 'Пожалуйста, заполните все обязательные поля',
    'app.form.success': 'Заявка отправлена!',
    'app.form.error': 'Ошибка при отправке заявки',
    'app.form.nameRequired': 'Пожалуйста, введите ваше имя',
    'app.form.phoneRequired': 'Пожалуйста, введите номер телефона',
    'app.form.phoneInvalid': 'Пожалуйста, введите корректный номер телефона',
    'app.form.commentRequired': 'Пожалуйста, заполните комментарий',
    // Common
    'common.order': 'Заказать',
    'common.send': 'Отправить',
    'common.cancel': 'Отмена',
    'common.close': 'Закрыть'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.ourServices': 'Our Services',
    'nav.ourProducts': 'Our Products',
    'nav.login': 'Login',
    // Main page
    'main.companyName': 'Steel Shift',
    'main.heroSubtitle': 'Professional metalworking services',
    'main.telegram': 'Telegram',
    'main.email': 'Email',
    'main.address': 'Shakespeare Street, 1"Zh"',
    'main.city': 'Nizhny Novgorod',
    'main.workDays': 'Mon-Fri',
    'main.workHours': 'from 9:00 to 18:30',
    'main.phone1': '+7 (495) 728-5000',
    'main.phone2': '+7 (495) 728-6000',
    'main.milling': 'Milling',
    'main.millingDesc': 'Universal and CNC equipment',
    'main.turning': 'Turning',
    'main.turningDesc': 'Universal and CNC equipment',
    'main.welding': 'Welding',
    'main.weldingDesc': 'Ferrous and non-ferrous metals',
    'main.cutting': 'Metal cutting',
    'main.cuttingDesc': 'Ferrous and non-ferrous metals',
    // Production page
    'production.stamps.title': 'Stamps. Pressforms. Bodies',
    'production.stamps.description': 'Professional services for manufacturing bodies from structural, tool steels, armored steels, as well as aluminum on modern CNC machines.',
    'production.pressforms.title': 'Pressforms',
    'production.pressforms.description': 'Manufacturing of pressforms for various industries.',
    'production.bodies.title': 'Bodies',
    'production.bodies.description': 'Production of bodies of various complexity.',
    'production.brake.title': 'Brake system',
    'production.brake.description': 'Application of any slots and perforations according to your wishes. Brake disc turning, perforation and slotting. Manufacturing of stators for rotary brake systems.',
    'production.belt.title': 'Belt drives',
    'production.belt.description': 'Modern equipment and highly qualified specialists. Belt drives for conveyors, machine tools, electric motorcycles, motorcycles with internal combustion engines.',
    'production.chain.title': 'Chain drives',
    'production.chain.description': 'Modern equipment and highly qualified specialists. Chain drives for conveyors, machine tools, electric motorcycles, motorcycles with internal combustion engines. Enlarged and non-standard sprockets for stunt riding.',
    'production.milling.title': 'Milling and turning',
    'production.milling.description': 'General purpose milling and turning',
    'production.orderButton': 'Order',
    'production.contactUs': 'Contact us',
    'production.nav.bodies': 'Bodies and pressforms',
    'production.nav.belts': 'Belt drives',
    'production.nav.chains': 'Chain drives',
    'production.nav.brake': 'Brake system',
    'production.nav.milling': 'Milling and turning',
    // Login page
    'login.welcome': 'Welcome',
    'login.tabLogin': 'Login',
    'login.tabRegister': 'Register',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.emailPlaceholder': 'Enter email',
    'login.passwordPlaceholder': 'Enter password',
    'login.loginButton': 'Login',
    'login.registerButton': 'Register',
    'login.name': 'Name',
    'login.namePlaceholder': 'Enter your name',
    'login.confirmPassword': 'Confirm password',
    'login.confirmPasswordPlaceholder': 'Repeat password',
    'login.testConnection': 'Test server connection',
    'login.footerText': 'Sign in or create a new account',
    // User cabinet
    'cabinet.welcome': 'Welcome!',
    'cabinet.email': 'Email',
    'cabinet.name': 'Name',
    'cabinet.id': 'ID',
    'cabinet.role': 'Role',
    'cabinet.roleAdmin': 'Administrator',
    'cabinet.roleUser': 'User',
    'cabinet.actions': 'Actions:',
    'cabinet.logout': 'Logout',
    'cabinet.title': 'My cabinet',
    'cabinet.profile': 'Profile',
    'cabinet.orders': 'My orders',
    'cabinet.adminPanel': 'Admin panel',
    'cabinet.accessDenied': 'You need to log in to access your personal cabinet.',
    'cabinet.info': 'Here you can manage your profile and settings.',
    // App page (Products)
    'app.companyName': 'Steel Shift',
    'app.surron': 'Surron',
    'app.talaria': 'Talaria',
    'app.beltDrive': 'Belt drive',
    'app.suspension': 'Swingarms',
    'app.surronBelts.description': 'Belt drives for Surron Ultra Bee and Light Bee. Belt pitches 8mm and 14mm. Kits with "SIT", "MEGADYNE", "CONTITECH" belts. High-quality components for reliable operation of your electric motorcycle. Steel components - 40Х steel, aluminum components - В95Т or 7075 alloy. \n Delivery to anywhere in the world.',
    'app.surronSuspension.description': 'Reinforced extended and standard swingarms for Surron Ultra Bee and Surron Light Bee. \n Delivery to anywhere in the world. ',
    'app.contactUs': 'Contact us',
    'app.form.name': 'Your name',
    'app.form.namePlaceholder': 'Enter your name',
    'app.form.phone': 'Phone',
    'app.form.comment': 'Comment',
    'app.form.commentPlaceholder': 'Describe your request',
    'app.form.fillAllFields': 'Please fill in all required fields',
    'app.form.success': 'Request sent!',
    'app.form.error': 'Error sending request',
    'app.form.nameRequired': 'Please enter your name',
    'app.form.phoneRequired': 'Please enter phone number',
    'app.form.phoneInvalid': 'Please enter a valid phone number',
    'app.form.commentRequired': 'Please fill in the comment',
    // Common
    'common.order': 'Order',
    'common.send': 'Send',
    'common.cancel': 'Cancel',
    'common.close': 'Close'
  }
}

export const useTranslation = () => {
  const languageStore = useLanguageStore()
  
  const t = (key: TranslationKey): string => {
    // Используем computed для реактивности
    return translations[languageStore.currentLanguage][key] || key
  }
  
  return { 
    t, 
    currentLanguage: computed(() => languageStore.currentLanguage)
  }
}
