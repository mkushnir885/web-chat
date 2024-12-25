import SubRouter from "../router/sub-router.js";
import sendStatic from "../controllers/send-static.js";
import {
  sendWssUrl,
  createChat,
  renameChat,
  searchChat,
  joinChat,
  exitChat,
} from "../controllers/chat-controler.js";

const chatRouter = new SubRouter();

chatRouter.get("/", async (client) => {
  const { req } = client;
  req.url = "/chats.html";
  sendStatic(client);
});

chatRouter.get("/server", sendWssUrl);

chatRouter.post("/create", createChat);

chatRouter.patch("/rename", renameChat);

chatRouter.get("/search", searchChat);

chatRouter.post("/join", joinChat);

chatRouter.delete("/exit", exitChat);

export default chatRouter;
