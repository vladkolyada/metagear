// Шрифти лежать у проєкті (пакети @fontsource), тому сайт не ходить на Google Fonts
import '@fontsource/unbounded/cyrillic-700.css'
import '@fontsource/unbounded/latin-700.css'
import '@fontsource/unbounded/cyrillic-900.css'
import '@fontsource/unbounded/latin-900.css'
import '@fontsource/golos-text/cyrillic-400.css'
import '@fontsource/golos-text/latin-400.css'
import '@fontsource/golos-text/cyrillic-600.css'
import '@fontsource/golos-text/latin-600.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
