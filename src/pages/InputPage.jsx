import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Collapse, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import RefreshIcon from '@mui/icons-material/Refresh'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileDropZone from '../components/FileDropZone.jsx'
import SettingsPanel from '../components/SettingsPanel.jsx'
import { SAMPLE_ITEMS_CSV, SAMPLE_SALES_CSV } from '../mocks/sampleData.js'
import { fadeUp } from '../theme.js'
import { validateParams } from '../utils/analysis.js'
import { downloadText } from '../utils/exportCsv.js'
import { plural } from '../utils/format.js'

const ISSUES_SHOWN = 50

// Карточка состояния одного файла: не загружен / загружен (сколько строк, сколько пропущено) / ошибка.
function FileCard({ title, columns, file, count, countWords, waitingText }) {
  let state = 'empty'
  if (file?.error) state = 'error'
  else if (file?.pending) state = 'waiting'
  else if (file) state = 'ok'

  const icon = {
    empty: <DescriptionOutlinedIcon sx={{ color: 'text.secondary' }} />,
    waiting: <DescriptionOutlinedIcon sx={{ color: 'warning.main' }} />,
    ok: <CheckCircleRoundedIcon sx={{ color: 'success.main' }} />,
    error: <ErrorRoundedIcon sx={{ color: 'error.main' }} />,
  }[state]

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ pt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ lineHeight: 1.3 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5 }}>
          {columns}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
          {state === 'empty' && <Box component="span" sx={{ color: 'text.secondary' }}>Файл не загружен</Box>}
          {state === 'waiting' && <Box component="span" sx={{ color: 'warning.main' }}>{file.name}: {waitingText}</Box>}
          {state === 'error' && <Box component="span" sx={{ color: 'error.main' }}>{file.name}: {file.error}</Box>}
          {state === 'ok' && (
            <>
              <strong>{file.name}</strong> — {count.toLocaleString('ru-RU')} {plural(count, countWords)}
              {file.issues.length > 0 && (
                <Box component="span" sx={{ color: 'warning.main' }}>
                  , пропущено строк: {file.issues.length}
                </Box>
              )}
            </>
          )}
        </Typography>
      </Box>
    </Paper>
  )
}

// Список строк, которые не прошли проверку и не попали в расчёт.
function IssuesList({ issues }) {
  const [open, setOpen] = useState(false)
  if (issues.length === 0) return null
  return (
    <Alert
      severity="warning"
      action={
        <Button color="inherit" size="small" onClick={() => setOpen(!open)}>
          {open ? 'Скрыть' : 'Показать'}
        </Button>
      }
    >
      Пропущено строк с ошибками: {issues.length}. Остальные данные пойдут в расчёт.
      <Collapse in={open}>
        <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.5, maxHeight: 280, overflow: 'auto' }}>
          {issues.slice(0, ISSUES_SHOWN).map((issue) => (
            <li key={`${issue.file}:${issue.line}`}>
              {issue.file}, строка {issue.line}: {issue.message}
            </li>
          ))}
        </Box>
        {issues.length > ISSUES_SHOWN && <div>…и ещё {issues.length - ISSUES_SHOWN}</div>}
      </Collapse>
    </Alert>
  )
}

// Экран загрузки: два CSV, настройки расчёта, кнопка «Рассчитать».
export default function InputPage({ dataset, onFiles, onLoadSample, params, onParamsChange, status, onCalculate }) {
  const [unknownFiles, setUnknownFiles] = useState([])
  const loading = status.state === 'loading'
  const paramErrors = validateParams(params)
  const canCalculate = dataset.ready && paramErrors.length === 0 && !loading
  // Сначала ошибки справочника, потом продаж; внутри файла — по номеру строки.
  const issues = [
    ...(dataset.items?.issues ?? []).toSorted((a, b) => a.line - b.line),
    ...(dataset.sales?.issues ?? []).toSorted((a, b) => a.line - b.line),
  ]

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Box sx={fadeUp(0)}>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 30, md: 40 } }}>
          Загрузка данных
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
          Справочник товаров и продажи по чекам — в формате кейса, разделитель «,» или «;».
        </Typography>
      </Box>

      <Box sx={fadeUp(80)}>
        <FileDropZone
          disabled={loading}
          onFiles={(files) => setUnknownFiles(onFiles(files))}
        />
      </Box>

      {unknownFiles.length > 0 && (
        <Alert severity="error" onClose={() => setUnknownFiles([])}>
          Не удалось понять, что за файл: {unknownFiles.join(', ')}. В заголовке items.csv должна быть колонка
          item_code, в sales.csv — doc_id, date, item_code, qty, price.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: { xs: 2, md: 3 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, ...fadeUp(160) }}>
        <FileCard
          title="Товары"
          columns="item_code, name, category"
          file={dataset.items}
          count={dataset.items?.items?.length ?? 0}
          countWords={['товар', 'товара', 'товаров']}
        />
        <FileCard
          title="Продажи"
          columns="doc_id, date, item_code, qty, price"
          file={dataset.sales}
          count={dataset.sales?.sales?.length ?? 0}
          countWords={['строка', 'строки', 'строк']}
          waitingText="проверим, когда будет загружен корректный справочник товаров"
        />
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, ...fadeUp(200) }}>
        <Button variant="outlined" startIcon={<ScienceOutlinedIcon />} onClick={onLoadSample} disabled={loading}>
          Загрузить пример
        </Button>
        <Typography variant="body2" sx={{ color: 'text.secondary', pl: { sm: 1 } }}>
          Скачать пример:
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={() => downloadText('items.csv', SAMPLE_ITEMS_CSV)}>
            items.csv
          </Button>
          <Button size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={() => downloadText('sales.csv', SAMPLE_SALES_CSV)}>
            sales.csv
          </Button>
        </Stack>
      </Stack>

      <IssuesList issues={issues} />

      <Box sx={fadeUp(240)}>
        <SettingsPanel params={params} onChange={onParamsChange} months={dataset.months} disabled={loading} />
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, ...fadeUp(280) }}>
        <Button
          variant="contained"
          size="large"
          endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
          disabled={!canCalculate}
          onClick={onCalculate}
          sx={(theme) => ({ boxShadow: canCalculate ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}` : 'none' })}
        >
          {loading ? 'Считаем…' : 'Рассчитать'}
        </Button>
        {!dataset.ready && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Загрузите оба файла или пример.
          </Typography>
        )}
      </Stack>

      {status.state === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onCalculate}>
              Повторить
            </Button>
          }
        >
          Не удалось выполнить расчёт: {status.error}
        </Alert>
      )}
    </Stack>
  )
}
