import { useState } from 'react'
import { Box, Button, Dialog, IconButton, Stack, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ParetoPlot from './ParetoPlot.jsx'
import { ABC_KEYS } from '../../utils/classes.js'
import { formatPercent, plural } from '../../utils/format.js'
import { classRanges } from '../../utils/pareto.js'

const goods = (n) => `${n.toLocaleString('ru-RU')} ${plural(n, ['товар', 'товара', 'товаров'])}`

// Итоги по классам: сколько товаров (и какая это часть ассортимента) дают какую долю выручки.
function ClassTotals({ data }) {
  const ranges = classRanges(data)
  return (
    <Box sx={{ display: 'grid', gap: { xs: 1, md: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
      {ABC_KEYS.filter((key) => ranges[key]).map((key) => {
        const { from, to } = ranges[key]
        const count = to - from + 1
        const revenue = data.slice(from, to + 1).reduce((sum, p) => sum + p.share, 0)
        return (
          <Stack key={key} direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 20, color: (t) => t.palette.classes[key] }}>{key}</Typography>
            <Typography variant="body2">
              <strong>{goods(count)}</strong> ({formatPercent((count / data.length) * 100, 0)} ассортимента) дают{' '}
              <strong>{formatPercent(revenue)}</strong> выручки
            </Typography>
          </Stack>
        )
      })}
    </Box>
  )
}

// Быстрые кнопки масштаба: топ-20, топ-50, только A, всё.
function presets(data) {
  const n = data.length
  const ranges = classRanges(data)
  const list = []
  if (n > 20) list.push({ label: 'Топ-20', start: 0, end: 19 })
  if (n > 50) list.push({ label: 'Топ-50', start: 0, end: 49 })
  ABC_KEYS.filter((key) => ranges[key]).forEach((key) =>
    list.push({ label: `Класс ${key}`, start: ranges[key].from, end: ranges[key].to }),
  )
  list.push({ label: 'Все', start: 0, end: n - 1 })
  return list
}

// Кривая Парето на весь экран: зоны классов, итоги и ползунок масштаба.
export default function ParetoDialog({ open, onClose, data, thresholds }) {
  const theme = useTheme()
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'))
  const [range, setRange] = useState({ start: 0, end: data.length - 1 })

  const visible = data.slice(range.start, range.end + 1)
  const visibleShare = visible.reduce((sum, p) => sum + p.share, 0)
  const isAll = range.start === 0 && range.end === data.length - 1

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isPhone}
      maxWidth={false}
      aria-labelledby="pareto-dialog-title"
      slotProps={{
        paper: {
          sx: {
            width: { sm: 'calc(100vw - 48px)' },
            height: { sm: 'calc(100vh - 48px)' },
            maxHeight: 'none',
            m: { sm: 3 },
            bgcolor: 'background.default',
            borderRadius: { xs: 0, sm: '28px' },
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, md: 3 },
            gap: 2,
          },
        },
        backdrop: { sx: { backdropFilter: 'blur(8px)' } },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography id="pareto-dialog-title" variant="h5">Кривая Парето</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Наведите на столбец, чтобы увидеть товар. Перетаскивайте края полосы внизу, чтобы приблизить часть графика.
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Закрыть" sx={{ bgcolor: 'action.hover' }}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <ClassTotals data={data} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {presets(data).map((preset) => {
            const active = preset.start === range.start && preset.end === range.end
            return (
              <Button
                key={preset.label}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setRange({ start: preset.start, end: preset.end })}
              >
                {preset.label}
              </Button>
            )
          })}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: { md: 'auto' } }}>
          {isAll
            ? `Показаны все ${goods(data.length)}`
            : `Показаны №${range.start + 1}–${range.end + 1}: ${goods(visible.length)} дают ${formatPercent(visibleShare)} выручки`}
        </Typography>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 280 }}>
        <ParetoPlot data={data} thresholds={thresholds} zones range={range} onRangeChange={setRange} />
      </Box>
    </Dialog>
  )
}
