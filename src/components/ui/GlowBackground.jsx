import { Box } from '@mui/material'

// Фон со свечением: три размытых цветных пятна, которые медленно «дышат».
// Лежит под всем интерфейсом и не мешает кликам.
const BLOBS = [
  { top: '-18%', left: '-10%', size: '55vw', delay: 0 },
  { top: '10%', left: '55%', size: '50vw', delay: -6 },
  { top: '60%', left: '15%', size: '45vw', delay: -12 },
]

export default function GlowBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        bgcolor: 'background.default',
        transition: 'background-color 400ms ease',
        '@keyframes drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(4vw, 3vh) scale(1.08)' },
        },
      }}
    >
      {BLOBS.map((blob, index) => (
        <Box
          key={index}
          sx={(theme) => ({
            position: 'absolute',
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            minWidth: 360,
            minHeight: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.surface.glows[index]} 0%, transparent 65%)`,
            filter: 'blur(40px)',
            animation: `drift 18s ease-in-out ${blob.delay}s infinite`,
          })}
        />
      ))}
    </Box>
  )
}
