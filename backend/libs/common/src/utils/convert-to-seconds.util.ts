export function convertToSecondsUtil(timeInput?: string | number): number {
    // Значение по умолчанию: 5 минут
    const defaultSeconds = 5 * 60;

    // Обработка undefined / null
    if (timeInput === undefined || timeInput === null) {
        return defaultSeconds;
    }

    // Если уже число — возвращаем как есть (целое, секунды)
    if (typeof timeInput === 'number' && Number.isFinite(timeInput)) {
        return Math.max(0, Math.floor(timeInput));
    }

    const timeStr = String(timeInput).trim();

    if (timeStr.length === 0) {
        return defaultSeconds;
    }

    // Если простое число в строке — трактуем как секунды
    if (/^\d+$/.test(timeStr)) {
        return parseInt(timeStr, 10);
    }

    // Разбираем по суффиксу единицы измерения
    const lastChar = timeStr[timeStr.length - 1];

    let multiplier: number;
    switch (lastChar) {
        case 's':
        case 'S':
            multiplier = 1;
            break;
        case 'm':
            multiplier = 60;
            break;
        case 'h':
        case 'H':
            multiplier = 60 * 60;
            break;
        case 'd':
        case 'D':
            multiplier = 24 * 60 * 60;
            break;
        case 'M': // месяц
            multiplier = 30 * 24 * 60 * 60;
            break;
        case 'y':
        case 'Y':
            multiplier = 365 * 24 * 60 * 60;
            break;
        default:
            throw new Error('Invalid time string');
    }

    const numPart = timeStr.slice(0, -1);
    const num = parseInt(numPart, 10);
    if (Number.isNaN(num)) {
        return defaultSeconds;
    }

    return num * multiplier;
}
