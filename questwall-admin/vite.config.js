import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',  // 部署到 /admin 子路径
  server: {
    port: 5174,  // 管理后台使用 5174 端口，避免和用户前端 5173 冲突
  },
})
