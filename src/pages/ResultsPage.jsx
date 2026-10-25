import { useRef, useState } from 'react'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import AbcXyzMatrix from '../components/AbcXyzMatrix.jsx'
import ClassSummary from '../components/ClassSummary.jsx'
import ItemsTable from '../components/ItemsTable.jsx'
import KpiCard from '../components/KpiCard.jsx'
import ParetoChart from '../components/ParetoChart.jsx'
import { fadeUp } from '../theme.js'
import { buildMatrix, summarizeClasses } from '../utils/analysis.js'
import { EMPTY_FILTERS } from '../utils/classes.js'
import { buildResultCsv, downloadText } from '../utils/exportCsv.js'
import { formatDateTime, formatMoney, formatMonth, formatPercent, plural } from '../utils/format.js'

const pct = (fraction) => `${+(fraction * 100).toFixed(2)} %`
const num = (value) => value.toLocaleString('ru-RU')

// Параметры, с которыми реально считали (из ответа бэкенда), — для трассируемости.
function ParamsChips({ params }) {
  const chips = [
    `${formatMonth(params.from)} — ${formatMonth(params.to)} (${params.months} мес.)`,
    `A < ${pct(params.abc.a)}, B < ${pct(params.abc.b)}`,
    `X: CV < ${num(params.xyz.x)}, Y: CV < ${num(params.xyz.y)}`,
    `расчёт ${formatDateTime(params.calculatedAt)}`,
  ]
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
      {chips.map((text) => (
        <Chip key={text} label={text} size="small" sx={{ fontWeight: 500, bgcolor: 'action.hover' }} />
      ))}
    </Stack>
  )
}

// Экран результатов: KPI, матрица-постеры, Парето, сводка по классам и таблица товаров.
export default function ResultsPage({ result }) {
  const rows = result.items
  const { params } = result
  const total = rows.length
  const summary = summarizeClasses(rows)
  const matrix = buildMatrix(rows)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const tableRef = useRef(null)

  const selectedGroup = filters.abc !== 'all' && filters.xyz !== 'all' ? filters.abc + filters.xyz : null
  const selectGroup = (group) => {
    setFilters(group ? { ...EMPTY_FILTERS, abc: group[0], xyz: group[1] } : EMPTY_FILTERS)
    if (group) tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const exportCsv = () => downloadText(`abc-xyz-${params.from}_${params.to}.csv`, buildResultCsv(rows))
  const exportButton = (
    <Button variant="contained" startIcon={<FileDownloadRoundedIcon />} onClick={exportCsv}>
      Скачать CSV
    </Button>
  )

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', ...fadeUp(0) }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 30, md: 40 } }}>
            Результаты анализа
          </Typography>
          <ParamsChips params={params} />
        </Box>
        {exportButton}
      </Box>

      <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2.5 }, gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        <KpiCard
          label="Товаров"
          value={total}
          hint={`${num(result.summary.salesRows)} ${plural(result.summary.salesRows, ['строка', 'строки', 'строк'])} продаж`}
          delay={50}
        />
        <KpiCard label="Выручка" value={result.summary.revenueTotal} format={formatMoney} hint={`за ${params.months} мес.`} delay={120} />
        <KpiCard
          label="Доля A в выручке"
          value={summary.abc.A.share * 100}
          format={(v) => formatPercent(v, 0)}
          hint={`всего ${summary.abc.A.count} из ${total} товаров`}
          accent="A"
          delay={190}
        />
        <KpiCard
          label="Стабильный спрос (X)"
          value={summary.xyz.X}
          hint={`${formatPercent(total ? (summary.xyz.X / total) * 100 : 0, 0)} ассортимента`}
          accent="X"
          delay={260}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' } }}>
        <AbcXyzMatrix matrix={matrix} unclassified={summary.xyz['-']} selected={selectedGroup} onSelect={selectGroup} />
        <Box sx={{ minWidth: 0, ...fadeUp(300) }}>
          <ParetoChart items={rows} thresholds={[params.abc.a * 100, params.abc.b * 100]} />
        </Box>
      </Box>

      <Box sx={fadeUp(350)}>
        <ClassSummary summary={summary} total={total} />
      </Box>

      <Box ref={tableRef} sx={{ scrollMarginTop: 80, ...fadeUp(400) }}>
        <ItemsTable rows={rows} filters={filters} onFiltersChange={setFilters} />
      </Box>
    </Stack>
  )
}
