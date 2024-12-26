import sendEvent from "../send-event.js";

export default async function handleNewMessage(
  ws,
  { body, chatId },
  chats,
  users,
  models,
) {
  const user = users.get(ws);
  const timestamp = Date.now();

  const messageId = await models.message.create({
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
