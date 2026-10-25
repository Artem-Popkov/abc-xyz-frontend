// Ошибка работы с API. Общая для клиента и мока, чтобы не возникало циклических импортов.
export class ApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
