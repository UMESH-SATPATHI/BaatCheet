import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './style.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.querySelector('#app')).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
  </StrictMode>,
)