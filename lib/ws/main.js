import { WebSocket, WebSocketServer } from 'ws';
import EventEmitter from 'events';

const eventEmitter = new EventEmitter();

const users = new Map();

const PORT = 8090;

const wss = new WebSocketServer({ port: PORT });

eventEmitter.on('USER_ONLINE', (ws, data) => {
  const { user } = data;
  users.set(ws, user);
  // TODO: get chat history and sent to user
});

eventEmitter.on('CHAT_MESSAGE', (ws, data) => {
  const event = 'CHAT_MESSAGE';
  const { body } = data;
  const user = users.get(ws);
  const message = {
    author: user.name,
    timestamp: Date.now(),
    body,
  };
  // TODO: write message to DB
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, message }), { binary: false });
    }
  });
});

wss.on('connection', (ws) => {
  ws.on('message', (str) => {
    const data = JSON.parse(str);

    const { event } = data;
    eventEmitter.emit(event, ws, data);
  });

  wss.on('close', () => {
    users.delete(ws);
  });
});
