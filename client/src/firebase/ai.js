import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { firebaseApp } from './app.js';

/**
 * Gemini access for the design critique feature, via Firebase AI Logic.
 *
 * Firebase AI Logic proxies the call through the project's own backend, so
 * there is no API key to hold here — the app's existing Firebase config is
 * enough. `GoogleAIBackend` targets the Gemini Developer API specifically,
 * which is free-tier eligible; the alternative `VertexAIBackend` is metered
 * and requires the Blaze plan.
 */
const MODEL_NAME = 'gemini-3.6-flash';

let ai;

function aiInstance() {
  ai ??= getAI(firebaseApp(), { backend: new GoogleAIBackend() });
  return ai;
}

export function generativeModel(generationConfig) {
  return getGenerativeModel(aiInstance(), { model: MODEL_NAME, generationConfig });
}
