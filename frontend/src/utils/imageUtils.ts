/**
 * Утилита для получения правильных путей к изображениям
 * Работает как в dev, так и в production сборке
 */

/**
 * Получить URL изображения из assets
 * @param path - путь относительно src/assets/img/ (например: "apppage/beltkit/1.jpg")
 * @returns URL изображения
 */
export function getImageUrl(path: string): string {
    // Убираем префикс "src/assets/img/" если он есть
    let cleanPath = path.replace(/^src\/assets\/img\//, '').replace(/^assets\/img\//, '').replace(/^\/assets\/img\//, '')
    
    // В production сборке изображения копируются в public/img/
    // В dev режиме используем полный путь
    if (import.meta.env.PROD) {
        // В production файлы из public/img доступны по пути /img/
        // Это работает, потому что Vite копирует public/ в корень dist/
        return `/img/${cleanPath}`
    } else {
        // В dev режиме используем полный путь
        return `/src/assets/img/${cleanPath}`
    }
}

