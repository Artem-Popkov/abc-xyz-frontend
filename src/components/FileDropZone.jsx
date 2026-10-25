import { useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'

// Большая зона: перетащите один или оба CSV или нажмите, чтобы выбрать.
// Наверх отдаём массив { name, text } — какой файл какой, определяет родитель по заголовку.
export default function FileDropZone({ onFiles, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const readFiles = async (fileList) => {
    const files = [...fileList].slice(0, 2)
    if (files.length === 0) return
    onFiles(await Promise.all(files.map(async (file) => ({ name: file.name, text: await file.text() }))))
  }

  const stop = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Загрузить CSV-файлы"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={(event) => {
        stop(event)
        if (!disabled) setDragging(true)
      }}
      onDragOver={stop}
      onDragLeave={(event) => {
        stop(event)
        if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false)
      }}
      onDrop={(event) => {
        stop(event)
        setDragging(false)
        if (!disabled) readFiles(event.dataTransfer.files)
      }}
      sx={(theme) => ({
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '28px',
        border: '2px dashed',
        borderColor: dragging ? 'primary.main' : alpha(theme.palette.text.primary, 0.16),
        bgcolor: dragging ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
        backdropFilter: 'blur(20px)',
        px: 3,
        py: { xs: 5, md: 7 },
        textAlign: 'center',
        transition: 'all 250ms ease',
        transform: dragging ? 'scale(1.01)' : 'none',
        outline: 'none',
        '&:hover, &:focus-visible': disabled ? {} : { borderColor: 'primary.main' },
      })}
    >
      <Box
        sx={(theme) => ({
          width: 72,
          height: 72,
          mx: 'auto',
          mb: 2,
          borderRadius: '22px',
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        })}
      >
        <CloudUploadRoundedIcon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="h5">Перетащите сюда items.csv и sales.csv</Typography>
      <Typography sx={{ mt: 1, color: 'text.secondary' }}>
        или нажмите, чтобы выбрать файлы. Можно оба сразу или по одному — тип определится по заголовку.
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        multiple
        hidden
        onChange={(event) => {
          readFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </Box>
  )
}
