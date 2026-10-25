import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { fadeUp, focusLift } from '../theme.js'
import { ABC_KEYS, XYZ_KEYS, posterGradient } from '../utils/classes.js'

const STEPS = [
  {
    icon: CloudUploadOutlinedIcon,
    title: 'Загрузите продажи',
    text: 'Два CSV-файла: справочник товаров и продажи по чекам.',
  },
  {
    icon: GridViewRoundedIcon,
    title: 'Получите классы',
    text: 'ABC по выручке, XYZ по стабильности спроса и матрица 3×3.',
  },
  {
    icon: FileDownloadOutlinedIcon,
    title: 'Скачайте отчёт',
    text: 'Таблица с классами в CSV — для Excel или отчёта.',
  },
]

// Декоративная матрица из 9 «постеров» справа от заголовка.
function HeroPosters() {
  return (
    <Box aria-hidden sx={fadeUp(250)}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: { xs: 1.25, md: 1.75 },
          width: { xs: '100%', sm: 380, md: 420 },
          mx: 'auto',
          transform: { md: 'perspective(1200px) rotateY(-14deg) rotateX(6deg)' },
        }}
      >
        {ABC_KEYS.flatMap((abc) =>
          XYZ_KEYS.map((xyz) => (
            <Box
              key={abc + xyz}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: { xs: '16px', md: '22px' },
                background: posterGradient(abc, xyz),
                opacity: abc === 'C' ? 0.75 : 1,
                color: '#fff',
                display: 'flex',
                alignItems: 'flex-end',
                p: { xs: 1.25, md: 1.75 },
                fontSize: { xs: 20, md: 26 },
                fontWeight: 800,
                letterSpacing: '-0.02em',
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                ...focusLift,
              }}
            >
              {abc + xyz}
            </Box>
          )),
        )}
      </Box>
    </Box>
  )
}

// Экран-обложка: что делает сервис и с чего начать.
export default function CoverPage({ onStart, onTrySample, sampleLoading }) {
  return (
    <Stack spacing={{ xs: 6, md: 10 }} sx={{ py: { xs: 4, md: 8 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.25fr 1fr' },
          alignItems: 'center',
          gap: { xs: 5, md: 6 },
        }}
      >
        <Box sx={fadeUp(0)}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
              px: 1.5,
              py: 0.5,
              mb: 3,
              borderRadius: 999,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              backdropFilter: 'blur(20px)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Выручка × стабильность спроса
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 42, sm: 56, md: 72 },
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: '-0.04em',
            }}
          >
            <Box
              component="span"
              sx={(theme) => ({
                background: `linear-gradient(90deg, ${theme.palette.classes.A}, ${theme.palette.classes.X} 55%, ${theme.palette.classes.Y})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              })}
            >
              ABC/XYZ-анализ
            </Box>
            <br />
            запасов
          </Typography>

          <Typography
            sx={{ mt: 3, maxWidth: 560, fontSize: { xs: 18, md: 21 }, lineHeight: 1.5, color: 'text.secondary' }}
          >
            Узнайте за минуту, какие товары приносят деньги, а какие лежат на складе мёртвым грузом.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 5 }}>
            <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={onStart}>
              Начать анализ
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onTrySample}
              disabled={sampleLoading}
              startIcon={sampleLoading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(20px)' }}
            >
              {sampleLoading ? 'Считаем пример…' : 'Попробовать на примере'}
            </Button>
          </Stack>
        </Box>

        <HeroPosters />
      </Box>

      <Box
        component="ol"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: { xs: 2, md: 3 },
        }}
      >
        {STEPS.map((step, index) => (
          <Paper
            component="li"
            key={step.title}
            sx={{ p: { xs: 3, md: 4 }, position: 'relative', ...focusLift, ...fadeUp(400 + index * 120) }}
          >
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box
                sx={(theme) => ({
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  background: [
                    posterGradient('A', 'X'),
                    posterGradient('B', 'Y'),
                    posterGradient('C', 'Z'),
                  ][index],
                  boxShadow: theme.palette.surface.shadow,
                })}
              >
                <step.icon />
              </Box>
              <Typography sx={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: 'text.disabled', opacity: 0.5 }}>
                {index + 1}
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ mt: 3 }}>{step.title}</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.55 }}>{step.text}</Typography>
          </Paper>
        ))}
      </Box>
    </Stack>
  )
}
