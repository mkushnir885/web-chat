import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirName = path.dirname(fileURLToPath(import.meta.url));
const STATIC_PATH = path.join(dirName, '../../public');

const fileTypes = new Map([
  ['.html', 'text/html'],
  ['.ico', 'image/x-icon'],
  ['.css', 'text/css'],
  ['.js', 'text/javascript'],
]);

export default async function sendStatic(client) {
  const { req: { url }, res } = client;
  const fullPath = path.join(STATIC_PATH, url);

  try {
    const fileContent = (await fs.readFile(fullPath)).toString('utf-8');
    const ext = path.extname(fullPath);
    const contentType = fileTypes.get(ext);
    if (contentType) res.setHeader('Content-Type', contentType);
    res.statusCode = 200;
    res.end(fileContent);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
      res.end(`File ${path.basename(fullPath)} not found`);
    } else {
      res.statusCode = 500;
      res.end(err.message);
    }
  }
}
