import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
    },
  },
  // ✅ 여기 추가 (클라이언트 라우팅 지원)
  server: {
    allowedHosts: true,
    historyApiFallback: true,
  },
})
