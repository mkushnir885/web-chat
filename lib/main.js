import 'dotenv/config';

import http from 'node:http';
import { extname } from 'node:path';
import sendStatic from './controllers/send-static.js';
import Router from './router/router.js';
import Client from './client.js';
import parseReqBody from './parse-req-body.js';
import db from './init-db.js';

import rootRouter from './routes/root-router.js';
import signupRouter from './routes/signup-routes.js';
import loginRouter from './routes/login-routes.js';
import accountRouter from './routes/account-routes.js';
import logoutRouter from './routes/logout-routes.js';
import chatRouter from './routes/chat-routes.js';

const HOST = process.env.HTTP_HOST || 'localhost';
const PORT = process.env.HTTP_PORT || 8000;

const router = new Router(new Map([
  ['/', rootRouter],
  ['/signup', signupRouter],
  ['/login', loginRouter],
  ['/account', accountRouter],
  ['/logout', logoutRouter],
  ['/chat', chatRouter],
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

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

const shutDown = async () => {
  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });
    await db.close();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
