import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// デバッグ機能をインポート（開発環境のみ）
if (import.meta.env.DEV) {
  import('./utils/debug.js')
}

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
