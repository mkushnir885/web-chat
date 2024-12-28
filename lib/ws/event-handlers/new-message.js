import sendEvent from "../send-event.js";

export default async function handleNewMessage(
  ws,
  { message },
  chats,
  users,
  models,
) {
  const { body, chatId } = message;
  const user = users.get(ws);
  const timestamp = Date.now();

  const messageId = await models.message.create({
    body,
    timestamp,
    chatId,
    userId: user.id,
  });

  chats.get(chatId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendEvent(client, "CHAT_MESSAGE", {
        message: { messageId, chatId, author: user.name, timestamp, body },
      });
    }
  });
}
