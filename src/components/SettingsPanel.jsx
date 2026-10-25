import { useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import { DEFAULT_PARAMS, validateParams } from '../utils/analysis.js'
import { formatMonth } from '../utils/format.js'

const toNumber = (text) => Number(String(text).replace(',', '.'))
// 0.95 * 100 даёт 94.99999…, поэтому округляем для показа в поле.
const toPercent = (fraction) => +(fraction * 100).toFixed(4)

function ThresholdField({ label, value, onChange, helper, disabled, step }) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      fullWidth
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(toNumber(event.target.value))}
      helperText={helper}
      slotProps={{ htmlInput: { step, min: 0 } }}
    />
  )
}

// Раскрывающаяся панель «Настройки расчёта»: пороги ABC (в процентах), XYZ (CV) и период.
// В состоянии всё хранится дробями, как в контракте API.
export default function SettingsPanel({ params, onChange, months, disabled }) {
  const [expanded, setExpanded] = useState(false)
  const errors = validateParams(params)
  const update = (patch) => onChange({ ...params, ...patch })
  const isDefault =
    params.abc.a === DEFAULT_PARAMS.abc.a &&
    params.abc.b === DEFAULT_PARAMS.abc.b &&
    params.xyz.x === DEFAULT_PARAMS.xyz.x &&
    params.xyz.y === DEFAULT_PARAMS.xyz.y &&
    !params.from &&
    !params.to

  const summary = `A < ${toPercent(params.abc.a)} %, B < ${toPercent(params.abc.b)} % · X < ${params.xyz.x.toLocaleString('ru-RU')}, Y < ${params.xyz.y.toLocaleString('ru-RU')} · ${
    params.from || params.to
      ? `${params.from ? formatMonth(params.from) : 'начало'} — ${params.to ? formatMonth(params.to) : 'конец'}`
      : 'весь период'
  }`

  const monthSelect = (label, key) => (
    <TextField
      select
      size="small"
      fullWidth
      label={label}
      disabled={disabled || months.length === 0}
      value={params[key]}
      onChange={(event) => update({ [key]: event.target.value })}
      helperText={months.length === 0 ? 'Появится после загрузки продаж' : ' '}
      slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
    >
      <MenuItem value="">{key === 'from' ? 'С первого месяца' : 'По последний месяц'}</MenuItem>
      {months.map((month) => (
        <MenuItem key={month} value={month}>{formatMonth(month)}</MenuItem>
      ))}
    </TextField>
  )

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, value) => setExpanded(value)}
      disableGutters
      sx={{ '&::before': { display: 'none' }, overflow: 'hidden' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2, md: 3 }, py: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: 0 }}>
          <TuneRoundedIcon sx={{ color: 'text.secondary' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6">Настройки расчёта</Typography>
            <Typography variant="body2" sx={{ color: errors.length ? 'error.main' : 'text.secondary' }}>
              {errors.length ? 'Есть ошибки в настройках' : summary}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>ABC — по накопленной доле выручки</Typography>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
              <ThresholdField
                label="A, если до, %"
                value={toPercent(params.abc.a)}
                onChange={(v) => update({ abc: { ...params.abc, a: v / 100 } })}
                helper="по умолчанию 80"
                disabled={disabled}
                step={1}
              />
              <ThresholdField
                label="B, если до, %"
                value={toPercent(params.abc.b)}
                onChange={(v) => update({ abc: { ...params.abc, b: v / 100 } })}
                helper="дальше — C"
                disabled={disabled}
                step={1}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>XYZ — по коэффициенту вариации</Typography>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
              <ThresholdField
                label="X, если CV <"
                value={params.xyz.x}
                onChange={(v) => update({ xyz: { ...params.xyz, x: v } })}
                helper="по умолчанию 0,10"
                disabled={disabled}
                step={0.01}
              />
              <ThresholdField
                label="Y, если CV <"
                value={params.xyz.y}
                onChange={(v) => update({ xyz: { ...params.xyz, y: v } })}
                helper="дальше — Z"
                disabled={disabled}
                step={0.01}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Период наблюдения</Typography>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
              {monthSelect('С', 'from')}
              {monthSelect('По', 'to')}
            </Box>
          </Box>
        </Box>

        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {errors.map((message) => (
              <div key={message}>{message}</div>
            ))}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Месяцы без продаж считаются нулём. Если у товара меньше 3 месяцев с продажами, класс XYZ не
          присваивается («–»).
        </Typography>
        {!isDefault && (
          <Button size="small" sx={{ mt: 1.5, ml: -1 }} onClick={() => onChange(DEFAULT_PARAMS)} disabled={disabled}>
            Сбросить по умолчанию
          </Button>
        )}
      </AccordionDetails>
    </Accordion>
  )
}
