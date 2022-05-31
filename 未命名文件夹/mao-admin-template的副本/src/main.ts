
import { createApp } from 'vue'
import store from "./store"
import App from './App.vue'
import router from './router'
import SvgIcon from './icons'
import i18n from './i18n';
import "@/router/permission"
import "@/styles/index.scss"
import "normalize.css"
import 'element-plus/es/components/message/style/css' //使用 unplugin-element-plus 并且只使用组件 API，需要手动导入样式
import 'element-plus/es/components/message-box/style/css'

import vueParticles from 'vue-particles'
const app = createApp(App)

app.use(vueParticles)

SvgIcon(app)  //全局注册svg组件
app.use(i18n)
app.use(router)
app.use(store)
app.mount('#app')//插件要在mount前

export default i18n




