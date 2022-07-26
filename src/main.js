import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router/index.js'
import './assets/css/reset.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import '@geoman-io/leaflet-geoman-free'
import 'leaflet.chinesetmsproviders'

import 'virtual:svg-icons-register'
import SvgIcon from './components/SvgIcon/index.vue'
import elementIcons from './components/SvgIcon/svgicon'

import ElementPlus from 'element-plus'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

import { resetForm } from '@/utils/util.js'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.resetForm = resetForm

app.component('svg-icon', SvgIcon)

app.use(router)
app.use(store)
app.use(elementIcons)
app.use(ElementPlus, {
    locale: locale,
    size: 'small'
})

app.mount('#app')
