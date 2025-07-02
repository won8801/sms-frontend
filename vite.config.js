import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  // ✅ 중요: history fallback 설정 추가 (SPA 라우팅 지원)
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
    },
  },
  // ✅ Render에서 직접 경로 접근 시 index.html로 라우팅
  // (서버 설정으로 history fallback)
  preview: {
    // 로컬 preview 실행 시도 시에도 적용됨
    headers: {
      'Cache-Control': 'no-store',
    },
  },
})
