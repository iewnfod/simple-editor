import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    define: {
      'import.meta.env.ACCESS_KEY': JSON.stringify(env.ACCESS_KEY || '')
    },
    base: "/editor/",
    build: {
      outDir: 'dist/editor'
    }
  };
});
