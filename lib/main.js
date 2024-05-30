import http from 'node:http';
import { promises as fs } from 'node:fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const PORT = 8080;
const PUBLIC_PATH = `${dirname(fileURLToPath(import.meta.url))}/../public`;

const routes = new Map([
  ['GET', new Map([
    ['/', async () => (await fs.readFile(`${PUBLIC_PATH}/index.html`)).toString('utf-8')],
    ['/favicon.ico', async () => (await fs.readFile(`${PUBLIC_PATH}/favicon.ico`)).toString('utf-8')],
  ])],
]);

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  console.log({ method, url });
  const handler = routes.get(method).get(url);
  handler(req, res).then(
    (data) => {
      res.end(data);
    },
    () => {
      res.statusCode = 500;
      res.end('Internal server error');
    },
  );
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
