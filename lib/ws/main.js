import "dotenv/config";

import { WebSocket, WebSocketServer } from "ws";
import EventEmitter from "events";
import { logger, db } from "../config.js";

const eventEmitter = new EventEmitter();

const users = new Map();

const HOST = process.env.WS_HOST || "localhost";
const PORT = process.env.WS_PORT || 8001;
const SHUTDOWN_TIME = 5;

const wss = new WebSocketServer({ host: HOST, port: PORT });
logger.info(`WebSocket server running at [ws://${HOST}:${PORT}]`);

eventEmitter.on("USER_ONLINE", async (ws, data) => {
  users.set(ws, data.user);
  const rawMessages = await db.select("message").run();
  const messages = await Promise.all(
    rawMessages.map(async (message) => {
      const [{ nickname }] = await db
        .select("user")
        .fields(["nickname"])
        .where({ id: message.userId })
        .run();
      return {
        author: nickname,
        timestamp: message.timestamp,
        body: message.body,
      };
    }),
  );
  ws.send(JSON.stringify({ event: "CHAT_HISTORY", messages }), {
    binary: false,
  });
});

eventEmitter.on("CHAT_MESSAGE", async (ws, data) => {
  const event = "CHAT_MESSAGE";
  const { body } = data;
  const user = users.get(ws);
  const message = {
    author: user.name,
    timestamp: Date.now(),
    body,
  };
  await db
    .add("message")
    .fields(["body", "timestamp", "userId"])
    .setValues([message.body, message.timestamp, user.id])
    .run();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, message }), { binary: false });
    }
  });
});

wss.on("connection", (ws) => {
  ws.on("message", (str) => {
    const data = JSON.parse(str);

    const { event } = data;
    eventEmitter.emit(event, ws, data);
  });

  wss.on("close", () => {
    users.delete(ws);
  });
});

const shutDown = async () => {
  try {
    await new Promise((resolve, reject) => {
      wss.clients.forEach((client) => {
        client.close(1000, "The server is shutting down.");
      });
      setTimeout(() => {
        wss.close((err) => {
          if (err) reject(err);
          resolve();
        });
      }, SHUTDOWN_TIME);
    });
    await db.close();
    logger.info("WebSocket server has been shut down successfully");
    logger.close();
  } catch (err) {
    logger.error(`WebSocket server shutdown failed (${err.message})`);
    throw err;
  }
};

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
