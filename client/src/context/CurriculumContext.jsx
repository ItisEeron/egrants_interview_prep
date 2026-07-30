import { createContext, useContext } from 'react';
import { curriculum } from '../data/curriculum.js';

/**
 * Holds the static workbook content: weeks, problems, design chapters, checklists.
 *
 * The content is bundled into the build, so there is nothing to load and nothing
 * that can fail. `isLoading` and `error` are kept so consumers read the same
 * shape they get from the progress context.
 */
const CurriculumContext = createContext(null);

const value = { curriculum, error: null, isLoading: false };

export function CurriculumProvider({ children }) {
  return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
}

export function useCurriculumContext() {
  const context = useContext(CurriculumContext);
  if (!context) throw new Error('useCurriculumContext must be used inside <CurriculumProvider>');
  return context;
}
