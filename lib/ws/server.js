import "dotenv/config";

import { WebSocketServer } from "ws";

import handleUserOnline from "./event-handlers/user-online.js";
import handleUserOffline from "./event-handlers/user-offline.js";
import handleChatJoining from "./event-handlers/chat-joining.js";
import handleChatExit from "./event-handlers/chat-exit.js";
import handleNewMessage from "./event-handlers/new-message.js";
import createModels from "../models/create-models.js";

const HOST = process.env.WS_HOST || "localhost";
const PORT = process.env.WS_PORT || 8001;
const SHUTDOWN_TIME = 5;

const eventHandlers = {
  USER_ONLINE: handleUserOnline,
  USER_OFFLINE: handleUserOffline,
  CHAT_JOINING: handleChatJoining,
  CHAT_EXIT: handleChatExit,
  NEW_MESSAGE: handleNewMessage,
};

const handleConnection = (ws, chats, users, models) => {
  ws.on("message", (str) => {
    const { event, ...data } = JSON.parse(str);
    const handler = eventHandlers[event];
    if (handler) handler(ws, data, chats, users, models);
  });
};

const shutdownServer = async (wss, database, logger) => {
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
    await database.close();
    logger.info("WebSocket server has been shut down successfully");
    logger.close();
  } catch (err) {
    logger.error(`WebSocket server shutdown failed (${err.message})`);
    throw err;
  }
};

export default (database, logger) => {
  const models = createModels(database);

  const wss = new WebSocketServer({ host: HOST, port: PORT });
  logger.info(`WebSocket server running at [ws://${HOST}:${PORT}]`);

  const users = new Map();
  const chats = new Map();

  wss.on("connection", (ws) => handleConnection(ws, users, chats, models));

  const shutdown = () => shutdownServer(wss, database, logger);
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
