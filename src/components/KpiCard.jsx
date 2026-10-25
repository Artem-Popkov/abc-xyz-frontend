import { Paper, Typography } from '@mui/material'
import { fadeUp, focusLift } from '../theme.js'
import { useCountUp } from '../hooks/useCountUp.js'

// KPI-карточка с «набегающим» числом. format превращает число в текст (деньги, проценты…).
export default function KpiCard({ label, value, format = (v) => Math.round(v).toLocaleString('ru-RU'), hint, accent, delay = 0 }) {
  const animated = useCountUp(value)

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, height: '100%', ...focusLift, ...fadeUp(delay) }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 1,
          fontSize: { xs: 28, md: 36 },
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
          color: accent ? (theme) => theme.palette.classes[accent] : 'text.primary',
          whiteSpace: 'nowrap',
        }}
      >
        {format(animated)}
      </Typography>
      {hint && (
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {hint}
        </Typography>
      )}
    </Paper>
  )
}
