import { useMemo, useState } from 'react'
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import ParetoDialog from './pareto/ParetoDialog.jsx'
import ParetoPlot from './pareto/ParetoPlot.jsx'
import { ABC_KEYS, CLASS_MEANING } from '../utils/classes.js'
import { toChartData } from '../utils/pareto.js'

// Карточка с кривой Парето на дашборде. Кнопка ⛶ открывает график на весь экран
// с зонами классов, итогами и масштабом.
export default function ParetoChart({ items, thresholds }) {
  const [fullscreen, setFullscreen] = useState(false)
  const data = useMemo(() => toChartData(items), [items])

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6">Кривая Парето</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Немногие товары дают основную выручку
          </Typography>
        </Box>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center' }}>
          {ABC_KEYS.map((key) => (
            <Stack
              key={key}
              direction="row"
              spacing={0.75}
              title={CLASS_MEANING[key]}
              sx={{ alignItems: 'center', display: { xs: 'none', sm: 'flex' } }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: (t) => t.palette.classes[key] }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{key}</Typography>
            </Stack>
          ))}
          <Tooltip title="Открыть на весь экран">
            <IconButton onClick={() => setFullscreen(true)} aria-label="Открыть кривую Парето на весь экран" sx={{ bgcolor: 'action.hover' }}>
              <OpenInFullRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 320 }}>
        <ParetoPlot data={data} thresholds={thresholds} />
      </Box>

      {/* Окно монтируем только когда открыто: так масштаб сбрасывается при каждом открытии. */}
      {fullscreen && (
        <ParetoDialog open onClose={() => setFullscreen(false)} data={data} thresholds={thresholds} />
      )}
    </Paper>
  )
}
