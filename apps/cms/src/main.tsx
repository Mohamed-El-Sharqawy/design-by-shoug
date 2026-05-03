import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initI18n } from '@repo/i18n'
import { ApiClientProvider } from '@repo/api-client'
import { useLanguageStore } from '@/stores/language'
import App from './App'
import './index.css'

initI18n('ar')

// Sync i18n with persisted locale after zustand hydrates from localStorage
useLanguageStore.getState().initLanguage()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

const getToken = () => localStorage.getItem('token')
const onUnauthorized = () => {
  localStorage.removeItem('token')
  window.location.href = '/login'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider
        config={{
          baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
          getToken,
          onUnauthorized,
        }}
      >
        <App />
      </ApiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
)
