import { WebSocket, WebSocketServer } from 'ws';

const users = new Map();

const PORT = 8090;

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('message', (str) => {
    const data = JSON.parse(str);

    const { event } = data;
    if (event === 'USER_ONLINE') {
      const { user } = data;
      users.set(ws, user);
      // TODO: get chat history and sent to user
    } else if (event === 'CHAT_MESSAGE') {
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
    }
  });

  wss.on('close', () => {
    users.delete(ws);
  });
});
