import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { CurriculumProvider } from './context/CurriculumContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { WeekPage } from './pages/WeekPage.jsx';
import { DesignChapterPage } from './pages/DesignChapterPage.jsx';

export function App() {
  return (
    <CurriculumProvider>
      <ProgressProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="weeks/:weekId" element={<WeekPage />} />
              <Route path="design/:chapterId" element={<DesignChapterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </CurriculumProvider>
  );
}
