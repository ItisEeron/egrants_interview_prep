import { createContext, useContext, useEffect, useState } from 'react';
import { curriculumApi } from '../api/curriculumApi.js';

/**
 * Holds the static workbook content: weeks, problems, design chapters, checklists.
 * Fetched once on mount and never mutated.
 */
const CurriculumContext = createContext(null);

export function CurriculumProvider({ children }) {
  const [curriculum, setCurriculum] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    curriculumApi.fetchCurriculum().then(setCurriculum).catch(setError);
  }, []);

  return (
    <CurriculumContext.Provider value={{ curriculum, error, isLoading: !curriculum && !error }}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculumContext() {
  const context = useContext(CurriculumContext);
  if (!context) throw new Error('useCurriculumContext must be used inside <CurriculumProvider>');
  return context;
}
