import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import './lib/i18n'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'
import AppErrorBoundary from './components/AppErrorBoundary'

declare global {
  interface Window {
    __appMounted?: boolean;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)

window.__appMounted = true;
