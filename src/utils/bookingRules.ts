import { getISOWeek, startOfWeek, addWeeks, isSameDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Asia/Kolkata'
const ANCHOR_DATE = new Date('2024-01-01T00:00:00Z')

export function getCurrentRotationWeek(date: Date = new Date()): 1 | 2 {
    const zonedDate = toZonedTime(date, TIMEZONE)
    const tzAnchor = toZonedTime(ANCHOR_DATE, TIMEZONE)

    const diffInMs = zonedDate.getTime() - tzAnchor.getTime()
    const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7))

    return diffInWeeks % 2 === 0 ? 1 : 2
}

export function getBatchDays(batch: 1 | 2, date: Date = new Date()): number[] {
    const currentWeek = getCurrentRotationWeek(date)

    if (currentWeek === 1) {
        if (batch === 1) return [1, 2, 3] // Mon, Tue, Wed
        if (batch === 2) return [4, 5]    // Thu, Fri
    } else {
        if (batch === 1) return [4, 5]    // Thu, Fri
        if (batch === 2) return [1, 2, 3] // Mon, Tue, Wed
    }

    return []
}

export function isRegularDay(batch: 1 | 2, date: Date): boolean {
    const zonedDate = toZonedTime(date, TIMEZONE)
    const dayOfWeek = zonedDate.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat

    if (dayOfWeek === 0 || dayOfWeek === 6) return false

    const batchDays = getBatchDays(batch, date)
    return batchDays.includes(dayOfWeek)
}

export function canBook(
    batch: 1 | 2,
    targetDate: Date,
    currentDate: Date = new Date()
): { allowed: boolean; reason?: string; isExtra: boolean } {
    const targetZoned = toZonedTime(targetDate, TIMEZONE)
    const currentZoned = toZonedTime(currentDate, TIMEZONE)

    targetZoned.setHours(0, 0, 0, 0) // normalized start of day
    const todayZoned = new Date(currentZoned)
    todayZoned.setHours(0, 0, 0, 0)

    // Rule: Cannot book for past dates
    if (targetZoned < todayZoned) {
        return { allowed: false, reason: "Cannot book for past dates", isExtra: false }
    }

    // Rule: Max 2 weeks in advance
    const maxAdvanceDate = addWeeks(todayZoned, 2)
    if (targetZoned > maxAdvanceDate) {
        return { allowed: false, reason: "Can only book up to 2 weeks in advance", isExtra: false }
    }

    const isRegular = isRegularDay(batch, targetDate)

    if (isRegular) {
        // Regular booking rules
        const targetCutoff = new Date(targetZoned)
        targetCutoff.setHours(15, 0, 0, 0)

        // Rule: Must confirm before 3 PM of that day.
        if (isSameDay(targetZoned, currentZoned) && currentZoned >= targetCutoff) {
            return { allowed: false, reason: "Eligibility expired after 3 PM for regular booking", isExtra: false }
        }

        return { allowed: true, isExtra: false }
    } else {
        // Extra booking rules
        const previousDayCutoff = new Date(targetZoned)
        previousDayCutoff.setDate(previousDayCutoff.getDate() - 1)
        previousDayCutoff.setHours(15, 0, 0, 0)

        // Rule: Booking allowed only after 3 PM of previous day.
        if (currentZoned >= previousDayCutoff) {
            return { allowed: true, isExtra: true }
        } else {
            return { allowed: false, reason: "Extra booking allowed only after 3 PM of previous day", isExtra: true }
        }
    }
}
