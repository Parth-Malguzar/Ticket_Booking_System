import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'


import { GoogleOAuthProvider } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const savedTheme = window.localStorage.getItem("theme")

document.documentElement.dataset.theme = savedTheme === "light" ? "light" : "dark"

if (!googleClientId) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
