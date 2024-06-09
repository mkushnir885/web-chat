import SubRouter from '../router/sub-router.js';
import sendStatic from '../controllers/send-static.js';

const CHAT_SERVER = 'ws://localhost:8090';

const chatRouter = new SubRouter();

chatRouter.get('/', async (client) => {
  const { req } = client;
  req.url = '/chat.html';
  sendStatic(client);
});

chatRouter.get('/server', async (client) => {
  const { res, user } = client;
  const query = `id=${user.id}&name=${user.nickname}`;
  res.end(`${CHAT_SERVER}?${query}`);
});

export default chatRouter;
