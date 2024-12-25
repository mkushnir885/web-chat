import Message from "../../http/models/message.js";
import sendEvent from "../send-event.js";

export default async function handleNewMessage(
  ws,
  { body, chatId },
  users,
  chats,
) {
  const user = users.get(ws);
  const timestamp = Date.now();

  const messageId = await Message.create({
    body,
    timestamp,
    chatId,
    userId: user.id,
  });
  const message = { messageId, chatId, author: user.name, timestamp, body };

  chats.get(chatId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendEvent(client, "CHAT_MESSAGE", { message });
    }
  });
}
