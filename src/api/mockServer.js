// Мок бэкенда: имитирует ответ POST /api/analysis прямо в браузере.
// Считает той же функцией, что повторяет методику бэкенда (utils/analysis.js).

import { computeAnalysis, validateParams } from '../utils/analysis.js'
import { ApiError } from './errors.js'

const DELAY_MS = 600

// Проверяет, что запрос похож на настоящий (как бы это сделал бэкенд).
function validateRequest(request) {
  if (!request?.params || !Array.isArray(request.items) || !Array.isArray(request.sales)) {
    throw new ApiError('Неверный формат запроса: нужны params, items и sales', 400)
  }
  const errors = validateParams(request.params)
  if (request.items.length === 0) errors.push('Нет товаров')
  if (request.sales.length === 0) errors.push('Нет продаж')
  if (errors.length > 0) throw new ApiError(errors.join('; '), 400)
}

export async function mockRunAnalysis(request) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

  if (import.meta.env.VITE_MOCK_ERROR === 'true') {
    throw new ApiError('Имитация ошибки сервера (VITE_MOCK_ERROR=true)', 500)
  }

  validateRequest(request)

  const { params, items, sales } = request
  const result = computeAnalysis({ items, sales, params })
  if (result.error) throw new ApiError(result.error, 422)

  return {
    params: {
      abc: params.abc,
      xyz: params.xyz,
      from: result.months[0],
      to: result.months.at(-1),
      months: result.months.length,
      calculatedAt: new Date().toISOString(),
    },
    items: result.rows,
    summary: {
      items: result.rows.length,
      revenueTotal: result.total,
      salesRows: result.salesUsed,
    },
    warnings: [],
  }
}
