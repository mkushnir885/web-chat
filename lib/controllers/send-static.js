import { promises as fs } from 'node:fs';
import { dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import HttpError from './http-error.js';

const dirName = dirname(fileURLToPath(import.meta.url));

export default async function readStaticFile(relPath) {
  const fullPath = `${dirName}/../${relPath}`;
  try {
    return (await fs.readFile(fullPath)).toString('utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new HttpError(404, `File ${basename(fullPath)} not found`);
    }
    throw err;
  }
}
