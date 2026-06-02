export const HOUR_HEIGHT_PX = 60

// 06:00 ~ 익일 05:00 — 24슬롯 ([6,7,...,23, 0,1,2,3,4,5])
export const HOURS: number[] = [
  ...Array.from({ length: 18 }, (_, i) => i + 6),
  ...Array.from({ length: 6 }, (_, i) => i),
]

// "HH:mm:ss" → 그리드 top(px) (기준: 06:00)
export function timeToOffsetPx(time: string): number {
  const [h, m] = time.split(":").map(Number)
  const index = h >= 6 ? h - 6 : h + 18
  return index * HOUR_HEIGHT_PX + (m / 60) * HOUR_HEIGHT_PX
}

// offsetPx → "HH:mm:ss" (15분 단위 스냅)
export function offsetPxToTime(px: number): string {
  const clampedPx = Math.max(0, Math.min(px, HOUR_HEIGHT_PX * HOURS.length - 1))
  const hourIndex = Math.floor(clampedPx / HOUR_HEIGHT_PX)
  const minute = Math.floor((clampedPx % HOUR_HEIGHT_PX) / (HOUR_HEIGHT_PX / 4)) * 15
  const hour = HOURS[hourIndex]
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
}

// "HH:mm:ss" → 자정 기준 절대 분 수
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

// 자정 기준 절대 분 수 → "HH:mm:ss"
export function absoluteMinutesToTimeString(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

// "HH:mm:ss" → "HH:mm"
export function formatTime(time: string): string {
  const [h, m] = time.split(":")
  return `${h}:${m}`
}

// 두 시간 문자열 사이의 분 수 차이 (자정 초과 고려)
export function durationMinutes(start: string, end: string): number {
  const s = parseTimeToMinutes(start)
  const e = parseTimeToMinutes(end)
  return e >= s ? e - s : 24 * 60 - s + e
}
