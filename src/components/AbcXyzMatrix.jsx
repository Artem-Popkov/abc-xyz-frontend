import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material'
import { fadeUp, focusLift } from '../theme.js'
import { ABC_KEYS, CLASS_MEANING, GROUP_ADVICE, XYZ_KEYS, posterGradient } from '../utils/classes.js'
import { plural } from '../utils/format.js'

const axisLabel = { fontSize: 13, fontWeight: 700, color: 'text.secondary' }

// Матрица 3×3 в виде цветных «постеров»: строки — ABC, столбцы — XYZ.
// В плитке: группа, число товаров и короткий совет. Пустые группы приглушены.
// Клик по плитке фильтрует таблицу товаров по этой группе (onSelect).
export default function AbcXyzMatrix({ matrix, unclassified, selected, onSelect }) {
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
      <Typography variant="h6">Матрица ABC/XYZ</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
        Нажмите на группу, чтобы увидеть её товары в таблице
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, 1fr)', gap: { xs: 1, sm: 1.5 } }}>
        <span />
        {XYZ_KEYS.map((xyz) => (
          <Stack key={xyz} sx={{ alignItems: 'center', pb: 0.5 }}>
            <Typography sx={{ ...axisLabel, color: (t) => t.palette.classes[xyz] }}>{xyz}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {CLASS_MEANING[xyz]}
            </Typography>
          </Stack>
        ))}

        {ABC_KEYS.map((abc, row) => [
          <Stack key={abc} sx={{ justifyContent: 'center', pr: 0.5 }}>
            <Typography sx={{ ...axisLabel, color: (t) => t.palette.classes[abc] }}>{abc}</Typography>
          </Stack>,
          ...XYZ_KEYS.map((xyz, col) => {
            const group = abc + xyz
            const count = matrix[abc][xyz]
            const active = selected === group
            return (
              <ButtonBase
                key={group}
                onClick={() => onSelect(active ? null : group)}
                disabled={count === 0}
                aria-pressed={active}
                aria-label={`${group}: ${count} ${plural(count, ['товар', 'товара', 'товаров'])}, ${GROUP_ADVICE[group]}`}
                sx={{
                  position: 'relative',
                  minHeight: { xs: 96, sm: 128 },
                  p: { xs: 1.25, sm: 2 },
                  borderRadius: { xs: '14px', sm: '20px' },
                  color: '#fff',
                  background: posterGradient(abc, xyz),
                  opacity: count === 0 ? 0.35 : 1,
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 10px 24px rgba(0, 0, 0, 0.18)',
                  outline: active ? '3px solid' : 'none',
                  outlineColor: 'text.primary',
                  outlineOffset: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  overflow: 'hidden',
                  ...focusLift,
                  ...fadeUp(150 + (row * 3 + col) * 60),
                  // Блик сверху, как на постерах tvOS.
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 45%)',
                    pointerEvents: 'none',
                  },
                  '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main' },
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>{group}</Typography>
                <Typography sx={{ fontSize: { xs: 28, sm: 38 }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                  {count}
                </Typography>
                <Typography
                  sx={{ mt: 'auto', fontSize: 12, lineHeight: 1.3, opacity: 0.9, display: { xs: 'none', sm: 'block' } }}
                >
                  {GROUP_ADVICE[group]}
                </Typography>
              </ButtonBase>
            )
          }),
        ])}
      </Box>

      {unclassified > 0 && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Ещё {unclassified} {plural(unclassified, ['товар', 'товара', 'товаров'])} без класса XYZ: меньше 3 месяцев с
          продажами.
        </Typography>
      )}
    </Paper>
  )
}
