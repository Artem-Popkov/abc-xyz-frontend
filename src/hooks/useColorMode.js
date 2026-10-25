import { useEffect, useState } from 'react'

const STORAGE_KEY = 'abc-xyz-color-mode'

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const systemMode = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

// Тема интерфейса: по умолчанию как в системе, выбор пользователя запоминается в localStorage.
export function useColorMode() {
  const [stored, setStored] = useState(readStored)
  const [system, setSystem] = useState(systemMode)

  // Пока пользователь сам не выбрал тему, следим за сменой темы в системе.
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return undefined
    const onChange = () => setSystem(media.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const mode = stored ?? system

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setStored(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage недоступен (приватный режим) — тема просто не запомнится.
    }
  }

  return { mode, toggle }
}
