/**
 * Google Drive backend — not implemented yet.
 *
 * To finish it:
 *   1. Create a Google Cloud project and enable the Drive API.
 *   2. Create an OAuth client, then fill the GOOGLE_* values in server/.env.
 *   3. `npm install googleapis -w server`.
 *   4. Replace the two throws below with Drive files.get / files.update calls
 *      against a single JSON file named `config.googleDrive.fileName`.
 *
 * The rest of the app talks to storage only through the StorageAdapter contract,
 * so finishing this adapter requires no changes anywhere else.
 */

const NOT_IMPLEMENTED =
  'Google Drive storage is not implemented yet. Set STORAGE_DRIVER=local in server/.env.';

async function read() {
  throw new Error(NOT_IMPLEMENTED);
}

async function write() {
  throw new Error(NOT_IMPLEMENTED);
}

export const googleDriveAdapter = { name: 'google-drive', read, write };
