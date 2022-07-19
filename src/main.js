import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/css/reset.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet'
import '@geoman-io/leaflet-geoman-free'

const app = createApp(App)
app.use(router)
app.mount('#app')
