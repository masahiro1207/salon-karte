import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  base: '/salon-karte/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    writeBundle: {
      async handler() {
        fs.copyFileSync('404.html', 'dist/404.html')
        if (fs.existsSync('public/favicon.ico')) {
          fs.copyFileSync('public/favicon.ico', 'dist/favicon.ico')
        }
      }
    }
  },
  server: {
    base: '/salon-karte/',
    proxy: {
      '/__/auth': {
        target: 'https://salon-chillo.firebaseapp.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/__\/auth/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  }
})
