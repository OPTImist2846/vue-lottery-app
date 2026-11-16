import { createPinia } from 'pinia'
import { createApp } from 'vue'
import './styles/main.scss'
import App from './App.vue'
import { createAppRouter } from './router'
import { setupHttp } from './setup-http'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
app.use(createPinia())

const router = createAppRouter()
app.use(router)
setupHttp(router)

const auth = useAuthStore()
if (auth.isAuthenticated) void auth.fetchCurrentUser().catch(() => undefined)

void router.isReady().then(() => app.mount('#app'))
