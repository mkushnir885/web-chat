import sendEvent from "../send-event.js";

export default async function handleUserOnline(
  ws,
  { user },
  chats,
  users,
  models,
) {
  users.set(ws, user);
  const chatIds = await models.user.getChatIdsById(user.id);
  chatIds.forEach((id) => {
    const chatConns = chats.get(id) || [];
    chatConns.push(ws);
    chats.set(id, chatConns);
  });

  const messages = await Promise.all(
    chatIds.map(async (id) => {
      const [{ name }] = await models.chat.getById(id);
      const chatMessages = await models.chat.getMessagesById(id);
      return [
        { chatId: id, chatName: name },
        await Promise.all(
          chatMessages.map(async (msg) => {
            const [{ nickname }] = await models.user.getById(msg.userId);
            return {
              id: msg.id,
              author: nickname || "???",
              timestamp: msg.timestamp,
              body: msg.body,
            };
          }),
        ),
      ];
    }),
  );

  sendEvent(ws, "CHATS_HISTORY", { messages: Object.fromEntries(messages) });
}
