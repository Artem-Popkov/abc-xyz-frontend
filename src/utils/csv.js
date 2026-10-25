// Разбор двух CSV-файлов в формате кейса и бэкенда (docs/data-format.md):
//   items.csv — item_code, name, category
//   sales.csv — doc_id, date, item_code, qty, price
// Разделитель «,» или «;» (по заголовку), BOM допускается.
// Валидации и их порядок повторяют программу бэкенда: строка с первой найденной ошибкой
// пропускается с сообщением, остальные строки идут в расчёт.

const ITEM_COLUMNS = ['item_code']
const SALE_COLUMNS = ['doc_id', 'date', 'item_code', 'qty', 'price']
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const NUMBER_RE = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?$/

// Разбивает текст на записи с учётом кавычек ("" внутри кавычек — это одна кавычка).
// Для каждой записи запоминаем номер строки в файле, чтобы показывать его в ошибках.
function splitRecords(text, delimiter) {
  const records = []
  let cells = []
  let cell = ''
  let quoted = false
  let line = 1
  let recordLine = 1

  const endRecord = () => {
    cells.push(cell.trim())
    if (cells.length > 1 || cells[0] !== '') records.push({ line: recordLine, cells })
    cells = []
    cell = ''
  }

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i += 1
      } else if (ch === '"') {
        quoted = false
      } else {
        if (ch === '\n') line += 1
        cell += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === delimiter) {
      cells.push(cell.trim())
      cell = ''
    } else if (ch === '\n') {
      endRecord()
      line += 1
      recordLine = line
    } else if (ch !== '\r') {
      cell += ch
    }
  }
  endRecord()
  return records
}

// Общий разбор: заголовок, проверка обязательных колонок, записи с правильным числом полей.
// Возвращает { error } при фатальной ошибке (файл нельзя использовать) или { rows, issues }.
function parseTable(text, fileName, required) {
  const clean = text.replace(/^﻿/, '')
  const firstLine = clean.split('\n', 1)[0]
  const delimiter = (firstLine.match(/;/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? ';' : ','
  const [header, ...records] = splitRecords(clean, delimiter)

  if (!header) return { error: 'файл пустой' }
  const columns = header.cells.map((name) => name.toLowerCase())
  const missing = required.filter((name) => !columns.includes(name))
  if (missing.length > 0) {
    return { error: `в заголовке нет колонок: ${missing.join(', ')}` }
  }

  const issues = []
  const rows = []
  records.forEach(({ line, cells }) => {
    if (cells.length !== columns.length) {
      issues.push({ file: fileName, line, message: `ожидалось полей: ${columns.length}, найдено: ${cells.length}` })
      return
    }
    const row = {}
    columns.forEach((name, index) => {
      row[name] = cells[index]
    })
    rows.push({ line, row })
  })
  return { rows, issues }
}

function parseNumber(text) {
  return NUMBER_RE.test(text) ? Number(text.replace(',', '.')) : NaN
}

// Дата ГГГГ-ММ-ДД, причём реальная (2025-02-30 — ошибка).
function isValidDate(text) {
  const match = DATE_RE.exec(text)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

// Сегодняшняя дата в формате ГГГГ-ММ-ДД по местному времени.
export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// items.csv → { items: [{ item_code, name, category }], issues } или { error }.
export function parseItemsCsv(text, fileName = 'items.csv') {
  const table = parseTable(text, fileName, ITEM_COLUMNS)
  if (table.error) return table

  const issues = [...table.issues]
  const items = []
  const seen = new Set()
  table.rows.forEach(({ line, row }) => {
    const code = row.item_code
    if (!code) {
      issues.push({ file: fileName, line, field: 'item_code', message: 'пустой код товара' })
    } else if (seen.has(code)) {
      issues.push({ file: fileName, line, field: 'item_code', message: `код ${code} уже встречался выше` })
    } else {
      seen.add(code)
      items.push({ item_code: code, name: row.name || code, category: row.category ?? '' })
    }
  })

  if (items.length === 0) return { error: 'нет ни одного корректного товара' }
  return { items, issues }
}

// sales.csv → { sales: [{ doc_id, date, item_code, qty, price }], issues } или { error }.
// itemCodes — множество кодов из items.csv (для проверки «товар есть в справочнике»).
export function parseSalesCsv(text, itemCodes, { fileName = 'sales.csv', today = todayIso() } = {}) {
  const table = parseTable(text, fileName, SALE_COLUMNS)
  if (table.error) return table

  const issues = [...table.issues]
  const sales = []
  const seen = new Set()
  table.rows.forEach(({ line, row }) => {
    const bad = (field, message) => issues.push({ file: fileName, line, field, message })
    const qty = parseNumber(row.qty)
    const price = parseNumber(row.price)
    const key = `${row.doc_id}|${row.item_code}|${row.date}`

    if (!isValidDate(row.date)) return bad('date', `дата «${row.date}» не в формате ГГГГ-ММ-ДД`)
    if (row.date > today) return bad('date', `дата ${row.date} в будущем`)
    if (!(qty > 0)) return bad('qty', 'количество должно быть больше 0')
    if (!(price >= 0)) return bad('price', 'цена должна быть не меньше 0')
    if (!itemCodes.has(row.item_code)) return bad('item_code', `товара ${row.item_code || '(пусто)'} нет в items.csv`)
    if (seen.has(key)) return bad('doc_id', `повтор: чек ${row.doc_id}, товар ${row.item_code}, дата ${row.date}`)

    seen.add(key)
    sales.push({ doc_id: row.doc_id, date: row.date, item_code: row.item_code, qty, price })
  })

  if (sales.length === 0) return { error: 'нет ни одной корректной строки продаж' }
  return { sales, issues }
}

// Разбирает оба файла. Продажи проверяются по справочнику, поэтому зависят от items.
// files: { items: { name, text } | null, sales: { name, text } | null }
export function parseDataset(files) {
  const items = files.items ? { name: files.items.name, ...parseItemsCsv(files.items.text, files.items.name) } : null
  let sales = null
  if (files.sales) {
    sales = items?.items
      ? { name: files.sales.name, ...parseSalesCsv(files.sales.text, new Set(items.items.map((i) => i.item_code)), { fileName: files.sales.name }) }
      : { name: files.sales.name, pending: true }
  }
  const ready = Boolean(items?.items && sales?.sales)
  const months = ready ? [...new Set(sales.sales.map((s) => s.date.slice(0, 7)))].sort() : []
  return { items, sales, ready, months }
}

// По заголовку определяет, что это за файл: 'items', 'sales' или null.
export function detectFileKind(text) {
  const header = text.replace(/^﻿/, '').split('\n', 1)[0].toLowerCase()
  if (header.includes('doc_id') && header.includes('qty')) return 'sales'
  if (header.includes('item_code')) return 'items'
  return null
}

// Готовит CSV-текст: значения с разделителем, кавычками или переводом строки берутся в кавычки.
export function toCsv(header, rows) {
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n') + '\n'
}
