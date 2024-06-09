import SubRouter from '../router/sub-router.js';
import sendStatic from '../controllers/send-static.js';

const chatRouter = new SubRouter();

chatRouter.get('/', async (req, res) => {
  req.url = '/chat.html';
  sendStatic(req, res);
});

export default chatRouter;
