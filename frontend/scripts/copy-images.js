/**
 * Скрипт для копирования изображений из src/assets/img в public/img
 * Это необходимо для того, чтобы изображения были доступны в production сборке
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/assets/img');
const destDir = path.join(__dirname, '../public/img');

// Функция для рекурсивного копирования директории
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        // Создаем директорию для файла, если её нет
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
    }
}

// Копируем изображения
if (fs.existsSync(srcDir)) {
    console.log('📁 Копирование изображений из src/assets/img в public/img...');
    copyRecursiveSync(srcDir, destDir);
    console.log('✅ Изображения успешно скопированы!');
} else {
    console.log('⚠️  Директория src/assets/img не найдена');
}

