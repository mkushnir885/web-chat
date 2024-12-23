import SubRouter from "../router/sub-router.js";
import sendStatic from "../controllers/send-static.js";
import { createUser } from "../controllers/account-controller.js";

const signupRouter = new SubRouter();

signupRouter.get("/", async (client) => {
  const { req } = client;
  req.url = "/signup.html";
  sendStatic(client);
});

signupRouter.post("/", createUser);

export default signupRouter;
