import http from 'node:http';
import { extname } from 'node:path';
import sendStatic from './controllers/send-static.js';
import Router from './router/router.js';
import Client from './client.js';
import parseReqBody from './parse-req-body.js';

import rootRouter from './routes/root-router.js';
import signupRouter from './routes/signup-routes.js';
import loginRouter from './routes/login-routes.js';
import accountRouter from './routes/account-routes.js';
import logoutRouter from './routes/logout-routes.js';

const PORT = 8080;

const router = new Router(new Map([
  ['/', rootRouter],
  ['/signup', signupRouter],
  ['/login', loginRouter],
  ['/account', accountRouter],
  ['/logout', logoutRouter],
]));

const server = http.createServer(async (req, res) => {
  try {
    await parseReqBody(req);
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
  } catch (err) {
    res.statusCode = 500;
    res.end(err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
