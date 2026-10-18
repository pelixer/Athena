import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CapturePage } from './pages/CapturePage'
import { ObjePage } from './pages/ObjePage'
import { VisitPage } from './pages/VisitPage'
import { CardPage } from './pages/CardPage'
import { TemplatePage } from './pages/TemplatePage'
import { FolderPage } from './pages/FolderPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/folder/:folderId" element={<FolderPage />} />
      <Route path="/visit/:visitId" element={<VisitPage />} />
      <Route path="/visit/:visitId/capture" element={<CapturePage />} />
      <Route path="/visit/:visitId/template" element={<TemplatePage />} />
      <Route path="/obje/:objeId" element={<ObjePage />} />
      <Route path="/obje/:objeId/card" element={<CardPage />} />
    </Routes>
  )
}
