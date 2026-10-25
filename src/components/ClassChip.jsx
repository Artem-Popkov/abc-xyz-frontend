import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Значок класса: A/B/C, X/Y/Z или «–», если XYZ не посчитан.
// Цвет берётся из темы, поэтому читается и в светлой, и в тёмной.
export default function ClassChip({ value }) {
  return (
    <Box
      component="span"
      sx={(theme) => {
        const color = theme.palette.classes[value] ?? theme.palette.text.secondary
        return {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 28,
          height: 24,
          px: 0.75,
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          color,
          bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.18 : 0.12),
        }
      }}
    >
      {value === '-' ? '–' : value}
    </Box>
  )
}
