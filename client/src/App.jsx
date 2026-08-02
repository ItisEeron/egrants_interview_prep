import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { AuthGate } from './components/auth/AuthGate.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CurriculumProvider } from './context/CurriculumContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { WeekPage } from './pages/WeekPage.jsx';
import { DesignChapterPage } from './pages/DesignChapterPage.jsx';
import { ProblemPracticePage } from './pages/ProblemPracticePage.jsx';

// On GitHub Pages the app is served from /<repo>/, not the domain root. Vite
// puts that prefix in BASE_URL; the router needs it without the trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <AuthProvider>
      <CurriculumProvider>
        <AuthGate>
          <ProgressProvider>
            <BrowserRouter basename={basename}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="weeks/:weekId" element={<WeekPage />} />
                  <Route path="weeks/:weekId/problems/:problemId" element={<ProblemPracticePage />} />
                  <Route path="design/:chapterId" element={<DesignChapterPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ProgressProvider>
        </AuthGate>
      </CurriculumProvider>
    </AuthProvider>
  );
}
