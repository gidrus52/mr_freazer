import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App'
import { router } from "./router";
import './assets/style/index.scss';
import 'custom-vue-scrollbar/dist/style.css';
import 'flag-icons/css/flag-icons.min.css';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
// app.use(style)
app.mount('#app')
