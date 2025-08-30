import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslintPlugin from "vite-plugin-eslint";
import {createStyleImportPlugin, AntdResolve} from 'vite-plugin-style-import';
import path, { resolve } from "path";
import tailwindcss from '@tailwindcss/vite'

function pathResolve(dir) {
  return resolve(process.cwd(), ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7001', // 你后端 API 的地址
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '') // 可选：去掉 /api 前缀
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    
    eslintPlugin({
      cache: false,
      failOnError: false,
      include: ["src/**/*.js", "src/**/*.tsx", "src/**/*.ts"],
    }),
    createStyleImportPlugin({
      resolves: [AntdResolve()]
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    postcss:{}
  },
  optimizeDeps: {
    include: ['classnames', 'react', 'react-dom']
  },
  resolve: {
    alias: [
  {
    find: /@\//,
    replacement: `${pathResolve("src")}/`,
  },
  {
    find: 'react-is',
    replacement: path.resolve(__dirname, 'node_modules/react-is'),
  },
],
  },
})
