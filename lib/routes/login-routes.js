import SubRouter from '../router/sub-router.js';
import sendStatic from '../controllers/send-static.js';
import { loginUser } from '../controllers/account-controller.js';

const loginRouter = new SubRouter();

loginRouter.get('/', async (client) => {
  const { req } = client;
  req.url = '/login.html';
  sendStatic(client);
});

loginRouter.post('/', loginUser);

export default loginRouter;
