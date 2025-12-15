/**
 * Утилита для управления лимитами отправки форм
 * Ограничения настраиваются в formLimitsConfig.ts
 */

import { FORM_LIMITS_CONFIG } from './formLimitsConfig'

const STORAGE_KEY = 'form_submissions_history'

interface SubmissionRecord {
    timestamp: number
    success: boolean
}

/**
 * Получить историю отправлений из localStorage
 */
function getSubmissionHistory(): SubmissionRecord[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored) as SubmissionRecord[]
        }
    } catch (error) {
        console.error('Ошибка при чтении истории отправлений:', error)
    }
    return []
}

/**
 * Сохранить историю отправлений в localStorage
 */
function saveSubmissionHistory(history: SubmissionRecord[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
        console.error('Ошибка при сохранении истории отправлений:', error)
    }
}

/**
 * Очистить старые записи (старше периода хранения)
 */
function cleanOldRecords(history: SubmissionRecord[]): SubmissionRecord[] {
    const now = Date.now()
    const retentionPeriod = FORM_LIMITS_CONFIG.HISTORY_RETENTION_PERIOD
    return history.filter(record => record.timestamp > now - retentionPeriod)
}

/**
 * Проверить, можно ли отправить форму
 * @returns {canSend: boolean, reason?: string} - можно ли отправить и причина отказа (если есть)
 */
export function canSendForm(): { canSend: boolean; reason?: string } {
    const history = cleanOldRecords(getSubmissionHistory())
    const now = Date.now()
    
    // Фильтруем только успешные отправления
    const successfulSubmissions = history.filter(record => record.success)
    
    // Проверка 1: Не более MAX_SUBMISSIONS_PER_DAY отправлений в день
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const submissionsToday = successfulSubmissions.filter(
        record => record.timestamp > oneDayAgo
    )
    
    if (submissionsToday.length >= FORM_LIMITS_CONFIG.MAX_SUBMISSIONS_PER_DAY) {
        const oldestToday = new Date(Math.min(...submissionsToday.map(s => s.timestamp)))
        const resetTime = new Date(oldestToday.getTime() + 24 * 60 * 60 * 1000)
        return {
            canSend: false,
            reason: `Достигнут лимит отправлений на сегодня (${FORM_LIMITS_CONFIG.MAX_SUBMISSIONS_PER_DAY}). Следующая отправка будет доступна после ${resetTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
        }
    }
    
    // Проверка 2: Не более MAX_SUBMISSIONS_PER_HOUR отправлений в час
    const oneHourAgo = now - 60 * 60 * 1000
    const submissionsLastHour = successfulSubmissions.filter(
        record => record.timestamp > oneHourAgo
    )
    
    if (submissionsLastHour.length >= FORM_LIMITS_CONFIG.MAX_SUBMISSIONS_PER_HOUR) {
        const oldestLastHour = new Date(Math.min(...submissionsLastHour.map(s => s.timestamp)))
        const resetTime = new Date(oldestLastHour.getTime() + 60 * 60 * 1000)
        return {
            canSend: false,
            reason: `Достигнут лимит отправлений за час (${FORM_LIMITS_CONFIG.MAX_SUBMISSIONS_PER_HOUR}). Следующая отправка будет доступна после ${resetTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
        }
    }
    
    // Проверка 3: Минимальный интервал между отправками (только для успешных)
    if (successfulSubmissions.length > 0) {
        const lastSuccessful = successfulSubmissions[successfulSubmissions.length - 1]
        const minInterval = FORM_LIMITS_CONFIG.MIN_INTERVAL_BETWEEN_SUBMISSIONS
        const minIntervalAgo = now - minInterval
        
        if (lastSuccessful.timestamp > minIntervalAgo) {
            const timeLeft = Math.ceil((lastSuccessful.timestamp + minInterval - now) / 1000)
            return {
                canSend: false,
                reason: `Пожалуйста, подождите ${timeLeft} секунд перед следующей отправкой`
            }
        }
    }
    
    return { canSend: true }
}

/**
 * Записать успешную отправку в историю
 */
export function recordSuccessfulSubmission(): void {
    const history = cleanOldRecords(getSubmissionHistory())
    history.push({
        timestamp: Date.now(),
        success: true
    })
    saveSubmissionHistory(history)
}

/**
 * Записать неуспешную отправку в историю (для статистики, но не влияет на лимиты)
 */
export function recordFailedSubmission(): void {
    const history = cleanOldRecords(getSubmissionHistory())
    history.push({
        timestamp: Date.now(),
        success: false
    })
    // Ограничиваем размер истории (храним максимум 100 записей)
    if (history.length > 100) {
        history.splice(0, history.length - 100)
    }
    saveSubmissionHistory(history)
}
