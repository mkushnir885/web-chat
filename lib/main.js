import http from 'node:http';
import { extname } from 'node:path';
import sendStatic from './controllers/send-static.js';
import Router from './router/router.js';
import SubRouter from './router/sub-router.js';
import chatRouter from './routes/chat-routes.js';

const PORT = 8080;

const rootSubRouter = new SubRouter();
rootSubRouter.get('/', async (req, res) => {
  req.url = '/index.html';
  sendStatic(req, res);
});

const router = new Router(new Map([
  ['/', rootSubRouter],
  ['/chat', chatRouter],
]));

const server = http.createServer(async (req, res) => {
  const handler = router.getHandler(req);
  if (handler) {
    await handler(req, res);
  } else if (req.method === 'GET' && extname(req.url)) {
    await sendStatic(req, res);
  } else {
    res.statusCode = 501;
    res.end('Not Implemented');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
