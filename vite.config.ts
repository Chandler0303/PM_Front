import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslintPlugin from "vite-plugin-eslint";
import {createStyleImportPlugin, AntdResolve} from 'vite-plugin-style-import';
import { resolve } from "path";

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
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: `${pathResolve("src")}/`,
      },
    ],
  },
})
