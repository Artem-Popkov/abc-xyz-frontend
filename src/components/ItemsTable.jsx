import { useMemo } from 'react'
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ClassChip from './ClassChip.jsx'
import { UNCLASSIFIED } from '../utils/analysis.js'
import { EMPTY_FILTERS } from '../utils/classes.js'
import { formatCv, formatMoney, formatShare } from '../utils/format.js'

// На телефоне второстепенные колонки скрываем, чтобы таблица помещалась.
const wide = { display: { xs: 'none', md: 'table-cell' } }

function applyFilters(rows, { query, category, abc, xyz }) {
  const q = query.trim().toLowerCase()
  return rows.filter((row) => {
    if (category !== 'all' && row.category !== category) return false
    if (abc !== 'all' && row.abc !== abc) return false
    if (xyz !== 'all' && row.xyz !== xyz) return false
    if (q && !row.item_code.toLowerCase().includes(q) && !row.name.toLowerCase().includes(q)) return false
    return true
  })
}

// Таблица товаров: поиск, фильтры по категории и классам. Фильтры хранит родитель,
// чтобы клик по плитке матрицы мог отфильтровать таблицу.
export default function ItemsTable({ rows, filters, onFiltersChange }) {
  const categories = useMemo(() => [...new Set(rows.map((row) => row.category).filter(Boolean))].sort(), [rows])
  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters])
  const set = (patch) => onFiltersChange({ ...filters, ...patch })
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)

  const select = (label, key, options) => (
    <TextField select size="small" label={label} value={filters[key]} onChange={(e) => set({ [key]: e.target.value })}>
      <MenuItem value="all">Все</MenuItem>
      {options.map(([value, text]) => (
        <MenuItem key={value} value={value}>{text}</MenuItem>
      ))}
    </TextField>
  )

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">Товары</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Показано {filtered.length} из {rows.length}
            {isFiltered && (
              <Button size="small" onClick={() => onFiltersChange(EMPTY_FILTERS)} sx={{ ml: 1, py: 0 }}>
                Сбросить фильтры
              </Button>
            )}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          mb: 2,
          gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1.2fr 0.8fr 0.8fr' },
          '& > :first-of-type': { gridColumn: { xs: '1 / -1', md: 'auto' } },
        }}
      >
        <TextField
          size="small"
          placeholder="Код или название"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Поиск по коду или названию' },
          }}
        />
        <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' }, display: 'grid' }}>
          {select('Категория', 'category', categories.map((c) => [c, c]))}
        </Box>
        {select('ABC', 'abc', ['A', 'B', 'C'].map((c) => [c, c]))}
        {select('XYZ', 'xyz', [['X', 'X'], ['Y', 'Y'], ['Z', 'Z'], [UNCLASSIFIED, '– (мало данных)']])}
      </Box>

      <TableContainer sx={{ maxHeight: 560 }}>
        <Table size="small" stickyHeader aria-label="Таблица товаров">
          <TableHead>
            <TableRow>
              <TableCell sx={wide}>Код</TableCell>
              <TableCell>Название</TableCell>
              <TableCell sx={wide}>Категория</TableCell>
              <TableCell align="right">Выручка</TableCell>
              <TableCell align="right" sx={wide}>Доля</TableCell>
              <TableCell align="right" sx={wide}>Накоп.</TableCell>
              <TableCell align="center">
                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>ABC</Box>
                <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>Класс</Box>
              </TableCell>
              <TableCell align="right" sx={wide}>CV</TableCell>
              <TableCell align="center" sx={wide}>XYZ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.item_code} hover>
                <TableCell sx={{ ...wide, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{row.item_code}</TableCell>
                <TableCell sx={{ fontWeight: 500, minWidth: { xs: 0, md: 140 } }}>
                  {row.name}
                  {/* На телефоне колонки «Код» нет — показываем код под названием. */}
                  <Box sx={{ display: { xs: 'block', md: 'none' }, color: 'text.secondary', fontSize: 12, fontWeight: 400 }}>
                    {row.item_code} · {row.category}
                  </Box>
                </TableCell>
                <TableCell sx={{ ...wide, color: 'text.secondary' }}>{row.category}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(row.revenue)}
                </TableCell>
                <TableCell align="right" sx={wide}>{formatShare(row.share, 2)}</TableCell>
                <TableCell align="right" sx={wide}>{formatShare(row.cumulativeShare, 1)}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <ClassChip value={row.abc} />
                  {/* На телефоне XYZ показываем в той же ячейке, отдельная колонка скрыта. */}
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' }, ml: 0.5 }}>
                    <ClassChip value={row.xyz} />
                  </Box>
                </TableCell>
                <TableCell align="right" sx={wide}>{formatCv(row.cv)}</TableCell>
                <TableCell align="center" sx={wide}><ClassChip value={row.xyz} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Ничего не найдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
