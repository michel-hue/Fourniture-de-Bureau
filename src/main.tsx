import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Forcer HTTPS en production (hors localhost)
if (
  import.meta.env.PROD &&
  window.location.protocol === 'http:' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
) {
  window.location.replace(
    `https://${window.location.host}${window.location.pathname}${window.location.search}`,
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)