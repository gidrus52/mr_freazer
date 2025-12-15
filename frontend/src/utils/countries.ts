export interface Country {
  code: string
  name: string
  nameEn: string
  dialCode: string
  flag: string
}

export const countries: Country[] = [
  { code: 'RU', name: 'Россия', nameEn: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'US', name: 'США', nameEn: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'Великобритания', nameEn: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Германия', nameEn: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'Франция', nameEn: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Италия', nameEn: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Испания', nameEn: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'CN', name: 'Китай', nameEn: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Япония', nameEn: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'Южная Корея', nameEn: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'IN', name: 'Индия', nameEn: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'BR', name: 'Бразилия', nameEn: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'AU', name: 'Австралия', nameEn: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Канада', nameEn: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'Мексика', nameEn: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Аргентина', nameEn: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'NL', name: 'Нидерланды', nameEn: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Бельгия', nameEn: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Швейцария', nameEn: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Австрия', nameEn: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Швеция', nameEn: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Норвегия', nameEn: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Дания', nameEn: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Финляндия', nameEn: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Польша', nameEn: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Чехия', nameEn: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'GR', name: 'Греция', nameEn: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PT', name: 'Португалия', nameEn: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'TR', name: 'Турция', nameEn: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'AE', name: 'ОАЭ', nameEn: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Саудовская Аравия', nameEn: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'IL', name: 'Израиль', nameEn: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'ZA', name: 'ЮАР', nameEn: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Египет', nameEn: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'NZ', name: 'Новая Зеландия', nameEn: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'SG', name: 'Сингапур', nameEn: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Малайзия', nameEn: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Таиланд', nameEn: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Вьетнам', nameEn: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'ID', name: 'Индонезия', nameEn: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Филиппины', nameEn: 'Philippines', dialCode: '+63', flag: '🇵🇭' }
]

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(c => c.code === code)
}

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find(c => c.dialCode === dialCode)
}

export const defaultCountry: Country = countries[0] // Россия по умолчанию
