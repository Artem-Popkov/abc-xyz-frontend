import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: './' — относительные пути к файлам сборки. Так сайт работает на GitHub Pages
// по адресу https://<логин>.github.io/<репозиторий>/ при любом имени репозитория.
export default defineConfig({
  base: './',
  plugins: [react()],
})
