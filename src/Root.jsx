import { useMemo } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App.jsx'
import GlowBackground from './components/ui/GlowBackground.jsx'
import { useColorMode } from './hooks/useColorMode.js'
import { createAppTheme } from './theme.js'

// Корень приложения: тема (светлая/тёмная), сброс стилей и фон со свечением.
export default function Root() {
  const { mode, toggle } = useColorMode()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlowBackground />
      <App colorMode={mode} onToggleColorMode={toggle} />
    </ThemeProvider>
  )
}
