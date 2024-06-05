import SubRouter from '../router/sub-router.js';
import sendStatic from '../controllers/send-static.js';
import { loginUser } from '../controllers/account-controller.js';

const loginRouter = new SubRouter();

loginRouter.get('/', async (req, res) => {
  req.url = '/login.html';
  sendStatic(req, res);
});

loginRouter.post('/', loginUser);

export default loginRouter;
