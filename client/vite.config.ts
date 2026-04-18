import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

function normalizeBasePath(path: string | undefined): string {
  if (!path || path === '/') {
    return '/'
  }

  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  return `${withLeadingSlash.replace(/\/+$/, '')}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeBasePath(env.VITE_APP_BASE_PATH)

  return {
    base,
    plugins: [react(), svgr()],
    server: {
      port: 5678,
      host: true,
      proxy: {
        '/api': 'http://localhost:3000',
        '/placement/api': 'http://localhost:3000',
      },
    },
  }
})
