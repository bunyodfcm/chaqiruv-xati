import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PreparePage } from '@/pages/PreparePage'
import { FilesProvider } from '@/store/FilesContext'
import { PrepareProvider } from '@/store/PrepareContext'

export default function App() {
  return (
    <FilesProvider>
      <PrepareProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<PreparePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PrepareProvider>
    </FilesProvider>
  )
}

