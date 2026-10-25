import { Box, Paper, Stack, Typography } from '@mui/material'
import { CLASS_MEANING } from '../utils/classes.js'
import { formatCv, formatShare, plural } from '../utils/format.js'

const UNCLASSIFIED_MEANING = 'мало данных'

// Полоса из цветных сегментов: ширина сегмента — доля, под полосой — подписи.
function SegmentBar({ segments }) {
  return (
    <>
      <Box sx={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', gap: '3px', my: 1.5 }}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <Box
              key={s.key}
              title={`${s.label}: ${formatShare(s.value)}`}
              sx={{
                flexGrow: s.value,
                flexBasis: 0,
                bgcolor: (t) => t.palette.classes[s.key] ?? t.palette.action.disabled,
                transition: 'flex-grow 600ms ease',
              }}
            />
          ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: `repeat(${Math.min(segments.length, 2)}, 1fr)`, sm: `repeat(${segments.length}, 1fr)` },
        }}
      >
        {segments.map((s) => (
          <Box key={s.key} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: (t) => t.palette.classes[s.key] ?? t.palette.action.disabled }} />
              <Typography sx={{ fontWeight: 700 }}>{s.label}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.main}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{s.hint}</Typography>
          </Box>
        ))}
      </Box>
    </>
  )
}

// Сводка по классам (требование кейса): доли A/B/C в выручке и распределение X/Y/Z.
export default function ClassSummary({ summary, total }) {
  const items = (n) => `${n} ${plural(n, ['товар', 'товара', 'товаров'])}`
  const abc = ['A', 'B', 'C'].map((key) => ({
    key,
    label: key,
    value: summary.abc[key].share,
    main: formatShare(summary.abc[key].share),
    hint: `${items(summary.abc[key].count)} · ${CLASS_MEANING[key]}`,
  }))
  const xyz = ['X', 'Y', 'Z', '-'].map((key) => ({
    key,
    label: key === '-' ? '–' : key,
    value: total ? summary.xyz[key] / total : 0,
    main: summary.xyz[key],
    hint: `${plural(summary.xyz[key], ['товар', 'товара', 'товаров'])} · ${key === '-' ? UNCLASSIFIED_MEANING : CLASS_MEANING[key]}`,
  }))

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 6 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' } }}>
        <Box>
          <Typography variant="h6">ABC — доля в выручке</Typography>
          <SegmentBar segments={abc} />
        </Box>
        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
            <Typography variant="h6">XYZ — стабильность спроса</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
              средний CV {formatCv(summary.avgCv, 2)}
            </Typography>
          </Stack>
          <SegmentBar segments={xyz} />
        </Box>
      </Box>
    </Paper>
  )
}
