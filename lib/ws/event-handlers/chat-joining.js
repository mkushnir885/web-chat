import sendEvent from "../send-event.js";

export default async function handleChatJoining(
  ws,
  { chat: { chatId } },
  chats,
  _,
  models,
) {
  const chatConns = chats.get(chatId) || [];
  chatConns.push(ws);
  chats.set(chatId, chatConns);

  const chatMessages = await models.chat.getMessagesById(chatId);
  const messages = await Promise.all(
    chatMessages.map(async (msg) => {
      const { nickname } = await models.user.getById(msg.userId);
      return {
        id: msg.id,
        author: nickname || "???",
        timestamp: msg.timestamp,
        body: msg.body,
      };
    }),
  );

  sendEvent(ws, "CHAT_HISTORY", { history: { chatId, messages } });
}
