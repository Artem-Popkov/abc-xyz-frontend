// Форматирование чисел и дат для русского интерфейса.

export function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

// value — уже в процентах (80 → «80,0 %»).
export function formatPercent(value, digits = 1) {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: digits })} %`
}

// value — доля (0.8 → «80,0 %»).
export const formatShare = (value, digits = 1) => formatPercent(value * 100, digits)

export function formatCv(cv, digits = 3) {
  return cv === null || cv === undefined ? '—' : cv.toLocaleString('ru-RU', { maximumFractionDigits: digits })
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

// «2025-03» → «мар 2025». Названия свои: Intl в разных браузерах сокращает по-разному.
export function formatMonth(yyyyMm) {
  const [year, month] = yyyyMm.split('-').map(Number)
  return `${MONTHS[month - 1]} ${year}`
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

// Склонение: plural(5, ['товар', 'товара', 'товаров']) → «товаров».
export function plural(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
