// Единственная точка связи фронта с бэкендом. Формат описан в docs/api-contract.md.
// Если VITE_USE_MOCKS не равно "false", вместо сети используется мок (src/api/mockServer.js).

import { mockRunAnalysis } from './mockServer.js'
import { ApiError } from './errors.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

// Отправляет данные и параметры на бэкенд, возвращает готовый результат расчёта.
export async function runAnalysis(request) {
  if (USE_MOCKS) {
    return mockRunAnalysis(request)
  }

  let response
  try {
    response = await fetch(`${API_URL}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
  } catch {
    throw new ApiError('Нет связи с сервером. Проверьте адрес VITE_API_URL и повторите попытку.')
  }

  if (!response.ok) {
    // Бэкенд по контракту присылает { error: "текст" }; если нет — показываем код ответа.
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.error ?? `Сервер вернул ошибку ${response.status}`, response.status)
  }
  return response.json()
}
