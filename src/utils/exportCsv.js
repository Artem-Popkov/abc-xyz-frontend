import { toCsv } from './csv.js'

// Скачивание текста как файла. BOM в начале нужен, чтобы Excel правильно открыл кириллицу.
export function downloadText(fileName, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿', text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Результат расчёта в CSV (требование кейса 12): item_code, name, revenue, abc, cv, xyz, class.
// Числа с точкой, CV пустой, если XYZ не посчитан (меньше 3 месяцев продаж).
export function buildResultCsv(rows) {
  return toCsv(
    ['item_code', 'name', 'revenue', 'abc', 'cv', 'xyz', 'class'],
    rows.map((row) => [row.item_code, row.name, row.revenue.toFixed(2), row.abc, row.cv ?? '', row.xyz, row.class]),
  )
}
