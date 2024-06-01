import http from 'node:http';
import { extname } from 'node:path';
import sendStatic from './controllers/send-static.js';
import Router from './router/router.js';
import SubRouter from './router/sub-router.js';
import Client from './client.js';

const PORT = 8080;

const rootSubRouter = new SubRouter();
rootSubRouter.get('/', async (client) => {
  const { req } = client;
  req.url = '/index.html';
  sendStatic(client);
});

const router = new Router(new Map([
  ['/', rootSubRouter],
]));

const server = http.createServer(async (req, res) => {
  const client = await Client.getInstance(req, res);
  const handler = router.getHandler(req);
  if (handler) {
    await handler(client);
  } else if (req.method === 'GET' && extname(req.url)) {
    await sendStatic(client);
  } else {
    res.statusCode = 501;
    res.end('Not Implemented');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
