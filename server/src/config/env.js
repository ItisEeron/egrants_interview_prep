import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const config = {
  port: Number(process.env.PORT) || 4000,
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  localDataFile: process.env.LOCAL_DATA_FILE || path.join(serverRoot, 'data', 'progress.json'),
  googleDrive: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    fileName: process.env.GOOGLE_DRIVE_FILE_NAME || 'egrants-interview-prep-progress.json',
  },
};
