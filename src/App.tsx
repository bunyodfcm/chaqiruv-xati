import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { ExcelPage } from '@/pages/ExcelPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { FilesProvider } from '@/store/FilesContext'

export default function App() {
  return (
    <FilesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="excel" element={<ExcelPage />} />
            <Route path="shablonlar" element={<TemplatesPage />} />
            <Route path="hujjatlar" element={<DocumentsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FilesProvider>
  )
}
