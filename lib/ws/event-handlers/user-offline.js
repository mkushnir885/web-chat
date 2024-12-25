export default async function handleUserOffline(ws, users, chats) {
  chats.forEach((conns, chatId) => {
    chats.set(
      chatId,
      conns.filter((conn) => conn !== ws),
    );
    if (chats.get(chatId).length === 0) chats.delete(chatId);
  });
  users.delete(ws);
}
