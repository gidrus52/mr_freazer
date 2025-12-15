import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Language = 'ru' | 'en'

const STORAGE_KEY = 'app_language'

// Функция для загрузки языка из localStorage
const loadLanguageFromStorage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'en') {
      return saved
    }
  } catch (error) {
    console.error('Ошибка при загрузке языка из localStorage:', error)
  }
  return 'ru' // Значение по умолчанию
}

// Функция для сохранения языка в localStorage
const saveLanguageToStorage = (lang: Language): void => {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch (error) {
    console.error('Ошибка при сохранении языка в localStorage:', error)
  }
}

export const useLanguageStore = defineStore('language', () => {
  // Загружаем язык из localStorage при инициализации
  const currentLanguage = ref<Language>(loadLanguageFromStorage())

  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    saveLanguageToStorage(lang)
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage.value === 'ru' ? 'en' : 'ru'
    currentLanguage.value = newLang
    saveLanguageToStorage(newLang)
  }

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage
  }
})
