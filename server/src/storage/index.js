import { config } from '../config/env.js';
import { localJsonAdapter } from './localJsonAdapter.js';
import { googleDriveAdapter } from './googleDriveAdapter.js';

const adapters = {
  local: localJsonAdapter,
  'google-drive': googleDriveAdapter,
};

export function getStorageAdapter() {
  const adapter = adapters[config.storageDriver];
  if (!adapter) {
    throw new Error(
      `Unknown STORAGE_DRIVER "${config.storageDriver}". Expected one of: ${Object.keys(adapters).join(', ')}.`,
    );
  }
  return adapter;
}
