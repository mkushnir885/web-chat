import SubRouter from "../router/sub-router.js";
import sendStatic from "../controllers/send-static.js";

const rootRouter = new SubRouter();

rootRouter.get("/", async (client) => {
  if (!client.isAuthenticated()) {
    const { req } = client;
    req.url = "/index.html";
    sendStatic(client);
  } else {
    client.res.writeHead(302, { Location: "/chat" });
    client.res.end("Redirecting to account page...");
  }
});

export default rootRouter;
