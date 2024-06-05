import SubRouter from '../router/sub-router.js';
import sendStatic from '../controllers/send-static.js';

const rootRouter = new SubRouter();

rootRouter.get('/', async (client) => {
  const { req } = client;
  req.url = '/index.html';
  sendStatic(client);
});

export default rootRouter;
