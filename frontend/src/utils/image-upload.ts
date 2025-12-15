/**
 * Утилиты для работы с изображениями
 */

export interface ImageUploadResult {
    imageData: string // Base64 данные
    imageType: string // Тип изображения (jpeg, png, etc.)
    fileName: string
    fileSize: number
    compressedSize: number
}

/**
 * Сжимает изображение до указанных параметров
 */
export const compressImage = (
    base64: string, 
    maxWidth: number = 800, 
    quality: number = 0.7
): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            
            // Вычисляем новые размеры
            let { width, height } = img
            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }
            
            canvas.width = width
            canvas.height = height
            
            // Рисуем сжатое изображение
            ctx.drawImage(img, 0, 0, width, height)
            
            // Конвертируем в base64 с заданным качеством
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
            
            console.log('📸 Изображение сжато:', {
                originalSize: base64.length,
                compressedSize: compressedBase64.length,
                compression: Math.round((1 - compressedBase64.length / base64.length) * 100) + '%',
                newDimensions: `${width}x${height}`
            })
            
            resolve(compressedBase64)
        }
        img.src = base64
    })
}

/**
 * Загружает и обрабатывает изображение из файла
 */
export const processImageFile = async (file: File): Promise<ImageUploadResult> => {
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
        throw new Error('Выберите изображение')
    }

    // Проверяем размер файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 2MB')
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const originalBase64 = e.target?.result as string
                console.log('📸 Оригинальное изображение загружено:', {
                    fileName: file.name,
                    fileSize: file.size,
                    base64Length: originalBase64.length
                })
                
                // Сжимаем изображение
                const compressedBase64 = await compressImage(originalBase64)
                
                // Определяем тип изображения
                const imageType = file.type.split('/')[1] || 'jpeg'
                
                resolve({
                    imageData: compressedBase64,
                    imageType,
                    fileName: file.name,
                    fileSize: file.size,
                    compressedSize: compressedBase64.length
                })
            } catch (error) {
                reject(error)
            }
        }
        reader.onerror = () => {
            reject(new Error('Ошибка чтения файла'))
        }
        reader.readAsDataURL(file)
    })
}

/**
 * Проверяет размер изображения
 */
export const validateImageSize = (imageData: string, maxSizeKB: number = 500): boolean => {
    const sizeKB = imageData.length * 0.75 / 1024 // Примерный размер в KB
    return sizeKB <= maxSizeKB
}

/**
 * Получает размер изображения в KB
 */
export const getImageSizeKB = (imageData: string): number => {
    return Math.round(imageData.length * 0.75 / 1024)
}
