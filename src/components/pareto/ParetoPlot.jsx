import { Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  Bar,
  Brush,
  Cell,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney, formatPercent } from '../../utils/format.js'
import { ABC_KEYS } from '../../utils/classes.js'
import { classRanges } from '../../utils/pareto.js'

// Сколько товаров должно быть видно, чтобы подписи кодов под столбцами не налезали друг на друга.
const MAX_TICKS = 40

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <Paper sx={{ px: 2, py: 1.5, borderRadius: '16px' }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        №{item.rank} · {item.code} · класс {item.abc}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.name}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>Выручка: {formatMoney(item.revenue)}</Typography>
      <Typography variant="body2">Доля: {formatPercent(item.share, 2)}</Typography>
      <Typography variant="body2">Накопленная: {formatPercent(item.cumulativeShare, 1)}</Typography>
    </Paper>
  )
}

// График Парето: столбцы — доля товара в выручке (цвет по классу ABC),
// линия — накопленная доля, пунктир — границы классов A и B.
// В полноэкранном режиме добавляются зоны классов (zones) и ползунок масштаба (range + onRangeChange).
export default function ParetoPlot({ data, thresholds, zones = false, range = null, onRangeChange = null }) {
  const theme = useTheme()
  const colors = theme.palette.classes
  const muted = theme.palette.text.secondary
  const start = range?.start ?? 0
  const end = range?.end ?? data.length - 1
  const visible = end - start + 1

  // Зоны A/B/C обрезаем по видимому диапазону: иначе Recharts не рисует область,
  // край которой оказался за пределами окна масштаба.
  const ranges = zones ? classRanges(data) : {}
  const areas = ABC_KEYS.filter((key) => ranges[key])
    .map((key) => ({ key, from: Math.max(ranges[key].from, start), to: Math.min(ranges[key].to, end) }))
    .filter((area) => area.from <= area.to)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
        barCategoryGap={visible > 200 ? 0 : '12%'}
      >
        <XAxis
          dataKey="code"
          hide={!onRangeChange || visible > MAX_TICKS}
          tick={{ fontSize: 11, fill: muted }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={56}
        />
        <YAxis
          yAxisId="share"
          tickFormatter={(v) => `${+v.toFixed(2)}%`}
          tick={{ fontSize: 12, fill: muted }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <YAxis
          yAxisId="cumulative"
          orientation="right"
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 12, fill: muted }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        {areas.map((area) => (
          <ReferenceArea
            key={area.key}
            yAxisId="cumulative"
            x1={data[area.from].code}
            x2={data[area.to].code}
            fill={colors[area.key]}
            fillOpacity={theme.palette.mode === 'dark' ? 0.1 : 0.07}
            // Без этого Recharts выбрасывает зону, если её край — товар с нулевой выручкой.
            ifOverflow="visible"
            label={{ value: area.key, position: 'insideTop', fontSize: 14, fontWeight: 700, fill: colors[area.key] }}
          />
        ))}
        <Tooltip content={<ChartTooltip />} cursor={{ fill: theme.palette.action.hover }} />
        <Bar yAxisId="share" dataKey="share" radius={visible > 200 ? 0 : [6, 6, 0, 0]} isAnimationActive={!onRangeChange}>
          {data.map((row) => (
            <Cell key={row.code} fill={colors[row.abc]} fillOpacity={0.85} />
          ))}
        </Bar>
        <Line
          yAxisId="cumulative"
          type="monotone"
          dataKey="cumulativeShare"
          stroke={theme.palette.text.primary}
          strokeWidth={2}
          dot={visible <= MAX_TICKS ? { r: 2.5, fill: theme.palette.text.primary } : false}
          isAnimationActive={!onRangeChange}
        />
        {thresholds.map((value) => (
          <ReferenceLine
            key={value}
            yAxisId="cumulative"
            y={value}
            stroke={muted}
            strokeDasharray="4 6"
            label={{ value: `${value}%`, position: 'insideTopRight', fontSize: 12, fill: muted }}
          />
        ))}
        {onRangeChange && (
          <Brush
            dataKey="rank"
            startIndex={start}
            endIndex={end}
            onChange={({ startIndex, endIndex }) => onRangeChange({ start: startIndex, end: endIndex })}
            height={44}
            travellerWidth={12}
            stroke={theme.palette.primary.main}
            fill={theme.palette.background.default}
            tickFormatter={(rank) => `№${rank}`}
          >
            {/* Мини-карта: вся кривая целиком, чтобы видеть, где находится окно. */}
            <ComposedChart data={data}>
              <Line type="monotone" dataKey="cumulativeShare" stroke={muted} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </Brush>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
