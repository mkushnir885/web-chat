import SubRouter from "../router/sub-router.js";
import sendStatic from "../controllers/send-static.js";
import sendWssUrl from "../controllers/chat-controler.js";

const chatRouter = new SubRouter();

chatRouter.get("/", async (client) => {
  const { req } = client;
  req.url = "/chat.html";
  sendStatic(client);
});

chatRouter.get("/server", sendWssUrl);

export default chatRouter;
