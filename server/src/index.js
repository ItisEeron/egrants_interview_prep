import { createApp } from './app.js';
import { config } from './config/env.js';
import { getStorageAdapter } from './storage/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`Storage driver: ${getStorageAdapter().name}`);
});
