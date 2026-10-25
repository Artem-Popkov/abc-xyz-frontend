import { useMemo, useState } from 'react'
import { Alert, Box, ButtonBase, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import CoverPage from './pages/CoverPage.jsx'
import InputPage from './pages/InputPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import { runAnalysis } from './api/client.js'
import { buildAnalysisRequest } from './api/buildRequest.js'
import { SAMPLE_ITEMS_CSV, SAMPLE_SALES_CSV } from './mocks/sampleData.js'
import { DEFAULT_PARAMS } from './utils/analysis.js'
import { detectFileKind, parseDataset } from './utils/csv.js'
import { posterGradient } from './utils/classes.js'

const NAV = [
  { value: 'input', label: 'Данные' },
  { value: 'results', label: 'Результаты' },
]

const SAMPLE_FILES = {
  items: { name: 'items.csv (пример)', text: SAMPLE_ITEMS_CSV },
  sales: { name: 'sales.csv (пример)', text: SAMPLE_SALES_CSV },
}

// Переключатель разделов в виде «таблетки», как в tvOS.
function NavPills({ screen, onChange, hasResult }) {
  return (
    <Stack
      direction="row"
      sx={{ p: 0.5, borderRadius: 999, bgcolor: 'action.hover', overflowX: 'auto', maxWidth: '100%' }}
    >
      {NAV.map((item) => {
        const active = screen === item.value
        const disabled = item.value !== 'input' && !hasResult
        return (
          <ButtonBase
            key={item.value}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            sx={{
              px: { xs: 1.75, sm: 2.5 },
              py: 0.75,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: active ? 'text.primary' : 'text.secondary',
              bgcolor: active ? 'background.paper' : 'transparent',
              boxShadow: active ? (t) => t.palette.surface.shadow : 'none',
              opacity: disabled ? 0.4 : 1,
              transition: 'all 250ms ease',
            }}
          >
            {item.label}
          </ButtonBase>
        )
      })}
    </Stack>
  )
}

export default function App({ colorMode, onToggleColorMode }) {
  const [screen, setScreen] = useState('cover')
  // Исходные тексты файлов; разбор и проверки — в parseDataset, поэтому порядок загрузки файлов не важен.
  const [files, setFiles] = useState({ items: null, sales: null })
  const dataset = useMemo(() => parseDataset(files), [files])
  const [params, setParams] = useState(DEFAULT_PARAMS)
  // Результат последнего расчёта. Параметры дашборд берёт из ответа, а не из формы,
  // чтобы после изменения формы не показывать чужие пороги.
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState({ state: 'idle', error: null })

  const calculate = async (data, calcParams) => {
    setStatus({ state: 'loading', error: null })
    try {
      const response = await runAnalysis(buildAnalysisRequest(data, calcParams))
      setResult(response)
      setStatus({ state: 'success', error: null })
      setScreen('results')
    } catch (error) {
      setStatus({ state: 'error', error: error.message })
    }
  }

  // Новые файлы: тип определяем по заголовку. Возвращаем имена файлов, которые не распознали.
  const handleFiles = (incoming) => {
    const next = { ...files }
    const unknown = []
    incoming.forEach((file) => {
      const kind = detectFileKind(file.text)
      if (kind) next[kind] = file
      else unknown.push(file.name)
    })
    // Новый файл продаж — другой набор месяцев, поэтому сбрасываем выбранный период.
    if (next.sales !== files.sales) setParams((prev) => ({ ...prev, from: '', to: '' }))
    setFiles(next)
    setStatus({ state: 'idle', error: null })
    return unknown
  }

  const loadSample = () => {
    setFiles(SAMPLE_FILES)
    setParams((prev) => ({ ...prev, from: '', to: '' }))
    setStatus({ state: 'idle', error: null })
  }

  // «Попробовать на примере»: загружаем встроенный пример и сразу считаем (весь период).
  const trySample = () => {
    loadSample()
    calculate(parseDataset(SAMPLE_FILES), { ...params, from: '', to: '' })
  }

  const hasResult = result !== null
  const isDark = colorMode === 'dark'

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(11, 13, 18, 0.6)' : 'rgba(245, 245, 247, 0.7)'),
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', height: 64 }}>
            <ButtonBase
              onClick={() => setScreen('cover')}
              sx={{ borderRadius: '10px', gap: 1.25, flexShrink: 0 }}
              aria-label="На главную"
            >
              <Box sx={{ width: 30, height: 30, borderRadius: '9px', background: posterGradient('A', 'X') }} />
              <Typography sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>ABC/XYZ</Typography>
            </ButtonBase>

            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
              {screen !== 'cover' && <NavPills screen={screen} onChange={setScreen} hasResult={hasResult} />}
            </Box>

            <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
              <IconButton onClick={onToggleColorMode} aria-label="Переключить тему" sx={{ bgcolor: 'action.hover' }}>
                {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" component="main" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
        {screen === 'cover' && (
          <>
            <CoverPage
              onStart={() => setScreen('input')}
              onTrySample={trySample}
              sampleLoading={status.state === 'loading'}
            />
            {status.state === 'error' && <Alert severity="error">Не удалось посчитать пример: {status.error}</Alert>}
          </>
        )}
        {screen === 'input' && (
          <InputPage
            dataset={dataset}
            onFiles={handleFiles}
            onLoadSample={loadSample}
            params={params}
            onParamsChange={setParams}
            status={status}
            onCalculate={() => dataset.ready && calculate(dataset, params)}
          />
        )}
        {screen === 'results' && hasResult && <ResultsPage result={result} />}
      </Container>
    </Box>
  )
}
