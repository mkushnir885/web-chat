import SubRouter from '../router/sub-router.js';
import { logoutUser } from '../controllers/account-controller.js';

const logoutRouter = new SubRouter();

logoutRouter.delete('/', logoutUser);

export default logoutRouter;
