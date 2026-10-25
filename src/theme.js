import { alpha, createTheme } from '@mui/material/styles'

// Цвета классов для текста, точек и столбцов. В тёмной теме — светлее, чтобы был контраст.
// A — изумрудный, B — янтарный, C — графитовый; X — синий, Y — фиолетовый, Z — розово-красный.
const CLASS_COLORS = {
  light: {
    A: '#047857', B: '#b45309', C: '#4b5563',
    X: '#1d4ed8', Y: '#7c3aed', Z: '#e11d48',
  },
  dark: {
    A: '#34d399', B: '#fbbf24', C: '#9ca3af',
    X: '#60a5fa', Y: '#a78bfa', Z: '#fb7185',
  },
}

// Насыщенные цвета для «постеров» матрицы: одинаковые в обеих темах, текст на них белый.
export const POSTER_COLORS = {
  A: '#047857', B: '#b45309', C: '#374151',
  X: '#1d4ed8', Y: '#6d28d9', Z: '#be123c',
}

const SURFACES = {
  light: {
    background: '#f5f5f7',
    glass: 'rgba(255, 255, 255, 0.62)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    shadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)',
    shadowHover: '0 2px 4px rgba(15, 23, 42, 0.06), 0 24px 48px rgba(15, 23, 42, 0.14)',
    glows: ['rgba(52, 211, 153, 0.35)', 'rgba(96, 165, 250, 0.35)', 'rgba(244, 114, 182, 0.28)'],
  },
  dark: {
    background: '#0b0d12',
    glass: 'rgba(28, 31, 40, 0.55)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 1px 2px rgba(0, 0, 0, 0.3), 0 16px 40px rgba(0, 0, 0, 0.45)',
    shadowHover: '0 2px 4px rgba(0, 0, 0, 0.35), 0 28px 60px rgba(0, 0, 0, 0.6)',
    glows: ['rgba(16, 185, 129, 0.28)', 'rgba(59, 130, 246, 0.30)', 'rgba(139, 92, 246, 0.26)'],
  },
}

export function createAppTheme(mode) {
  const surface = SURFACES[mode]
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#60a5fa' : '#0a66d8' },
      secondary: { main: isDark ? '#34d399' : '#047857' },
      background: { default: surface.background, paper: surface.glass },
      text: isDark
        ? { primary: '#f5f5f7', secondary: 'rgba(235, 235, 245, 0.62)' }
        : { primary: '#1d1d1f', secondary: 'rgba(60, 60, 67, 0.72)' },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
      classes: CLASS_COLORS[mode],
      surface,
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.035em' },
      h2: { fontWeight: 800, letterSpacing: '-0.03em' },
      h3: { fontWeight: 700, letterSpacing: '-0.025em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontWeight: 650, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
      overline: { fontWeight: 600, letterSpacing: '0.12em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: surface.background },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
      // Любой Paper выглядит как «стекло»: старые экраны тоже получают новый стиль.
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: surface.glass,
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            border: `1px solid ${surface.glassBorder}`,
            borderRadius: 24,
            boxShadow: surface.shadow,
          },
        },
      },
      MuiMenu: {
        styleOverrides: { paper: { borderRadius: 14, backgroundColor: isDark ? '#1c1f28' : '#ffffff' } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 22 },
          sizeLarge: { paddingBlock: 12, paddingInline: 28, fontSize: 16 },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
          head: { fontWeight: 600, color: isDark ? 'rgba(235, 235, 245, 0.62)' : 'rgba(60, 60, 67, 0.72)' },
          stickyHeader: { backgroundColor: isDark ? '#171a22' : '#fbfbfd' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12, backgroundColor: alpha('#ffffff', isDark ? 0.04 : 0.7) },
        },
      },
    },
  })
}

// Эффект «фокуса» как на Apple TV: карточка чуть увеличивается и поднимается.
export const focusLift = {
  transition: 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 320ms ease',
  '@media (hover: hover)': {
    '&:hover': {
      transform: 'translateY(-4px) scale(1.025)',
      boxShadow: (theme) => theme.palette.surface.shadowHover,
    },
  },
}

// Плавное появление блока снизу; delay — задержка в мс, чтобы блоки появлялись по очереди.
// Режим backwards: после анимации transform снова свободен, и эффект наведения работает.
export const fadeUp = (delay = 0) => ({
  animation: `fadeUp 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms backwards`,
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'none' },
  },
})
