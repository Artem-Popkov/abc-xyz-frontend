// Расчёт ABC/XYZ по методике бэкенда (консольная программа на Go). Эта же функция работает
// в моке бэкенда, поэтому пока бэкенд не подключён, результаты должны совпадать с его программой.
// Все доли и пороги — дроби (0.8 = 80 %), как в контракте API.

export const DEFAULT_PARAMS = {
  abc: { a: 0.8, b: 0.95 },
  xyz: { x: 0.1, y: 0.25 },
  from: '',
  to: '',
}

// Если месяцев с продажами меньше, XYZ не считается (класс «-»): σ/μ по 1–2 точкам бессмысленно.
export const MIN_ACTIVE_MONTHS = 3
export const UNCLASSIFIED = '-'

const round6 = (value) => Math.round(value * 1e6) / 1e6
const round2 = (value) => Math.round(value * 100) / 100

// «2025-03» → номер месяца подряд (год × 12 + месяц), и обратно.
const monthIndex = (yyyyMm) => Number(yyyyMm.slice(0, 4)) * 12 + Number(yyyyMm.slice(5, 7)) - 1
const monthLabel = (index) => `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`

// Ошибки параметров расчёта (пустой массив — всё корректно).
export function validateParams(params) {
  const errors = []
  const { abc, xyz, from, to } = params
  if (!(abc.a > 0 && abc.a < abc.b && abc.b < 1)) {
    errors.push('Пороги ABC: должно быть 0 < A < B < 100 %')
  }
  if (!(xyz.x > 0 && xyz.x < xyz.y)) {
    errors.push('Пороги XYZ: должно быть 0 < X < Y')
  }
  if (from && to && from > to) {
    errors.push('Начало периода позже конца')
  }
  return errors
}

const compareCodes = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

// Полный расчёт. Возвращает { months, rows, total, salesUsed } или { error }.
// rows уже отсортированы по убыванию выручки (при равенстве — по коду).
export function computeAnalysis({ items, sales, params }) {
  const from = params.from ? monthIndex(params.from) : null
  const to = params.to ? monthIndex(params.to) : null
  const inPeriod = sales.filter((s) => {
    const m = monthIndex(s.date)
    return !(from !== null && m < from) && !(to !== null && m > to)
  })
  if (inPeriod.length === 0) return { error: 'В выбранном периоде нет продаж' }

  // Период: от первого до последнего месяца с продажами, если границы не заданы явно.
  // Цикл, а не Math.min(...массив): на сотнях тысяч строк распаковка в аргументы переполняет стек.
  let first = Infinity
  let last = -Infinity
  inPeriod.forEach((s) => {
    const m = monthIndex(s.date)
    if (m < first) first = m
    if (m > last) last = m
  })
  const lo = from ?? first
  const hi = to ?? last
  const n = hi - lo + 1

  const byCode = new Map(
    items.map((item) => [item.item_code, { ...item, revenue: 0, monthly: new Array(n).fill(0) }]),
  )
  let total = 0
  inPeriod.forEach((s) => {
    const row = byCode.get(s.item_code)
    row.revenue += s.qty * s.price
    row.monthly[monthIndex(s.date) - lo] += s.qty
    total += s.qty * s.price
  })
  if (total === 0) return { error: 'Выручка за период равна нулю — ABC посчитать нельзя' }

  const list = [...byCode.values()].sort(
    (a, b) => b.revenue - a.revenue || compareCodes(a.item_code, b.item_code),
  )

  let cumulative = 0
  const rows = list.map((item) => {
    // ABC по доле ДО товара: первый товар всегда A, даже если он один даёт 90 % выручки.
    const before = round6(cumulative / total)
    const abc = before < params.abc.a ? 'A' : before < params.abc.b ? 'B' : 'C'
    cumulative += item.revenue

    // XYZ: CV = σ / μ, σ по N месяцам (не N − 1), месяцы без продаж = 0.
    const sum = item.monthly.reduce((acc, q) => acc + q, 0)
    const active = item.monthly.filter((q) => q > 0).length
    const avg = sum / n
    let cv = null
    let xyz = UNCLASSIFIED
    if (active >= MIN_ACTIVE_MONTHS) {
      const variance = item.monthly.reduce((acc, q) => acc + (q - avg) ** 2, 0) / n
      cv = round6(Math.sqrt(variance) / avg)
      xyz = cv < params.xyz.x ? 'X' : cv < params.xyz.y ? 'Y' : 'Z'
    }

    return {
      item_code: item.item_code,
      name: item.name,
      category: item.category,
      revenue: round2(item.revenue),
      share: round6(item.revenue / total),
      cumulativeShare: round6(cumulative / total),
      avgQty: round2(avg),
      activeMonths: active,
      cv,
      abc,
      xyz,
      class: abc + xyz,
    }
  })

  const months = Array.from({ length: n }, (_, i) => monthLabel(lo + i))
  return { months, rows, total: round2(total), salesUsed: inPeriod.length }
}

// Матрица 3×3: количество товаров в каждой паре ABC/XYZ. Товары без XYZ («-») не входят.
export function buildMatrix(rows) {
  const matrix = { A: { X: 0, Y: 0, Z: 0 }, B: { X: 0, Y: 0, Z: 0 }, C: { X: 0, Y: 0, Z: 0 } }
  rows.forEach((row) => {
    if (row.xyz !== UNCLASSIFIED) matrix[row.abc][row.xyz] += 1
  })
  return matrix
}

// Сводка по классам: число товаров и доля выручки по ABC, число товаров по XYZ, средний CV.
export function summarizeClasses(rows) {
  const total = rows.reduce((sum, row) => sum + row.revenue, 0)
  const abc = { A: { count: 0, share: 0 }, B: { count: 0, share: 0 }, C: { count: 0, share: 0 } }
  const xyz = { X: 0, Y: 0, Z: 0, [UNCLASSIFIED]: 0 }
  let cvSum = 0
  let cvCount = 0
  rows.forEach((row) => {
    abc[row.abc].count += 1
    abc[row.abc].share += total ? row.revenue / total : 0
    xyz[row.xyz] += 1
    if (row.cv !== null) {
      cvSum += row.cv
      cvCount += 1
    }
  })
  return { abc, xyz, avgCv: cvCount ? cvSum / cvCount : null }
}
