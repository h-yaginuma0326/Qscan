import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazily load pages for code splitting
const UploadPage = lazy(() => import('./pages/UploadPage'))
const MaskPage = lazy(() => import('./pages/MaskPage'))
const OcrPage = lazy(() => import('./pages/OcrPage'))
const PreviewPage = lazy(() => import('./pages/PreviewPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner size="large" /></div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/mask" element={<MaskPage />} />
          <Route path="/ocr" element={<OcrPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
