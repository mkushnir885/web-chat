import "dotenv/config";

import WebSocketServer from "ws";
import { logger, db } from "../config.js";

import handleUserOnline from "./event-handlers/user-online.js";
import handleUserOffline from "./event-handlers/user-offline.js";
import handleChatJoining from "./event-handlers/chat-joining.js";
import handleChatExit from "./event-handlers/chat-exit.js";
import handleNewMessage from "./event-handlers/new-message.js";

const HOST = process.env.WS_HOST || "localhost";
const PORT = process.env.WS_PORT || 8001;
const SHUTDOWN_TIME = 5;

const wss = new WebSocketServer({ host: HOST, port: PORT });
logger.info(`WebSocket server running at [ws://${HOST}:${PORT}]`);

const users = new Map();
const chats = new Map();

const eventHandlers = {
  USER_ONLINE: (ws, data) => handleUserOnline(ws, data, users, chats),
  USER_OFFLINE: (ws) => handleUserOffline(ws, users, chats),
  CHAT_JOINING: (ws, data) => handleChatJoining(ws, data, chats),
  CHAT_EXIT: (ws, data) => handleChatExit(ws, data, chats),
  NEW_MESSAGE: (ws, data) => handleNewMessage(ws, data, users, chats),
};

wss.on("connection", (ws) => {
  ws.on("message", (str) => {
    const { event, ...data } = JSON.parse(str);
    const handler = eventHandlers[event];
    if (handler) handler(ws, data);
  });

  ws.on("close", () => eventHandlers.USER_OFFLINE(ws));
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
