import "dotenv/config";

import http from "node:http";
import { extname } from "node:path";
import sendStatic from "./controllers/send-static.js";
import Router from "./router/router.js";
import Client from "./auth/client.js";
import parseReqBody from "./parse-req-body.js";
import createModels from "../models/create-models.js";

import rootRouter from "./routes/root-router.js";
import signupRouter from "./routes/signup-routes.js";
import loginRouter from "./routes/login-routes.js";
import accountRouter from "./routes/account-routes.js";
import logoutRouter from "./routes/logout-routes.js";
import chatRouter from "./routes/chat-routes.js";

const HOST = process.env.HTTP_HOST || "localhost";
const PORT = process.env.HTTP_PORT || 8000;

const router = new Router(
  new Map([
    ["/", rootRouter],
    ["/signup", signupRouter],
    ["/login", loginRouter],
    ["/account", accountRouter],
    ["/logout", logoutRouter],
    ["/chat", chatRouter],
  ]),
);

const handleReq = async (req, res, models, logger) => {
  try {
    await parseReqBody(req);
    const client = await Client.getInstance(req, res, models, logger);
    const handler = router.getHandler(req);
    if (handler) {
      await handler(client, models);
    } else if (req.method === "GET" && extname(req.url)) {
      await sendStatic(client);
    } else {
      res.statusCode = 501;
      res.end("Not Implemented");
    }
  } catch (err) {
    res.statusCode = 500;
    res.end(err.message);
  }
};

const shutdownServer = async (server, database, logger) => {
  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        resolve();
      });
    });
    await database.close();
    logger.info("HTTP server has been shut down successfully");
    logger.close();
  } catch (err) {
    logger.error(`HTTP server shutdown failed (${err.message})`);
    throw err;
  }
};

export default (database, logger) => {
  const models = createModels(database);

  const server = http.createServer((req, res) =>
    handleReq(req, res, models, logger),
  );
  server.listen(PORT, HOST, () => {
    logger.info(`HTTP server running at [http://${HOST}:${PORT}]`);
  });

  const shutdown = () => shutdownServer(server, database, logger);
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};