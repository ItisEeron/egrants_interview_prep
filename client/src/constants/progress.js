export const CONFIDENCE_OPTIONS = [
  { value: 'none', label: 'Not started', symbol: '○', tone: 'neutral' },
  { value: 'low', label: 'Shaky', symbol: '●', tone: 'danger' },
  { value: 'medium', label: 'Getting there', symbol: '●', tone: 'warning' },
  { value: 'high', label: 'Solid', symbol: '●', tone: 'success' },
];

export const EMPTY_PROBLEM_PROGRESS = {
  solved: false,
  reviewed: false,
  confidence: 'none',
  notes: '',
  submissions: {},
};

export const EMPTY_CHAPTER_PROGRESS = {
  stepNotes: {},
  checklist: {},
};

export function confidenceOption(value) {
  return CONFIDENCE_OPTIONS.find((option) => option.value === value) ?? CONFIDENCE_OPTIONS[0];
}
