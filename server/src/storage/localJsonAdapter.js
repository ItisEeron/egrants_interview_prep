import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env.js';
import { EMPTY_DOCUMENT } from './StorageAdapter.js';
import seedProgress from '../data/seedProgress.json' with { type: 'json' };

const filePath = config.localDataFile;

async function readFileIfPresent() {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function read() {
  const existing = await readFileIfPresent();
  if (existing) return { ...EMPTY_DOCUMENT, ...existing };

  // First run: start from the progress already recorded in the workbooks.
  const seeded = { ...EMPTY_DOCUMENT, ...seedProgress };
  await write(seeded);
  return seeded;
}

async function write(document) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  return document;
}

export const localJsonAdapter = { name: 'local', read, write };
