/**
 * The languages the practice editor offers, and what a blank one starts with.
 *
 * There's no compiler behind this editor, so the boilerplate is generic
 * rather than per-problem — a real per-problem starter would need a method
 * signature written for all three languages for every problem in the
 * workbook, which is exactly the authoring cost this feature was scoped to
 * avoid. One skeleton per language is all a critique-only editor needs.
 */
export const CODE_LANGUAGES = [
  { id: 'java', label: 'Java', monacoLanguage: 'java' },
  { id: 'python', label: 'Python', monacoLanguage: 'python' },
  { id: 'cpp', label: 'C++', monacoLanguage: 'cpp' },
];

const CODE_BOILERPLATE = {
  java: 'class Solution {\n    // your code here\n}\n',
  python: 'class Solution:\n    def solve(self, *args):\n        pass\n',
  cpp: 'class Solution {\npublic:\n    // your code here\n};\n',
};

export function boilerplateFor(language) {
  return CODE_BOILERPLATE[language] ?? '';
}
