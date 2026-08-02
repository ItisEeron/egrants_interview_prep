import Editor from '@monaco-editor/react';
import { CODE_LANGUAGES } from '../../../constants/codeBoilerplate.js';
import styles from './CodeEditor.module.css';

/**
 * A thin Monaco wrapper — language mapping and layout only. Persistence
 * (loading saved code, saving on blur) is the practice page's job, the same
 * way `ProgressContext` and not `ProblemNotes.jsx` itself owns saving there;
 * this stays a controlled component so the critique panel can read whatever
 * is currently typed, not just the last saved value.
 */
export function CodeEditor({ language, onLanguageChange, value, onChange, onBlur }) {
  const monacoLanguage = CODE_LANGUAGES.find((entry) => entry.id === language)?.monacoLanguage ?? 'plaintext';

  return (
    <div>
      <div className={styles.languages}>
        {CODE_LANGUAGES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={entry.id === language ? styles.languageActive : styles.language}
            onClick={() => onLanguageChange(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className={styles.wrapper}>
        <Editor
          height="420px"
          language={monacoLanguage}
          value={value}
          theme="vs-dark"
          onChange={(next) => onChange(next ?? '')}
          onMount={(editor) => editor.onDidBlurEditorText(onBlur)}
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
        />
      </div>
    </div>
  );
}
