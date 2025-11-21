import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'sw.js'
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('ServiceWorker registered:', registration)
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error)
      })
  })
}
