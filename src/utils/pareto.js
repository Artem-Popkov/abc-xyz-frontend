// Данные для кривой Парето.

// Строки ответа → точки графика. Доли из ответа — дроби, на графике удобнее проценты.
export function toChartData(items) {
  return items.map((item, index) => ({
    rank: index + 1,
    code: item.item_code,
    name: item.name,
    revenue: item.revenue,
    share: item.share * 100,
    cumulativeShare: item.cumulativeShare * 100,
    abc: item.abc,
  }))
}

// Где начинается и заканчивается каждый класс (индексы в отсортированном по выручке списке).
export function classRanges(data) {
  const ranges = {}
  data.forEach((point, index) => {
    if (!ranges[point.abc]) ranges[point.abc] = { from: index, to: index }
    ranges[point.abc].to = index
  })
  return ranges
}
