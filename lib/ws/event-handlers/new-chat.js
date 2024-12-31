export default async function handleNewChat(ws, { chat: { chatId } }, chats) {
  const chatConns = chats.get(chatId) || [];
  chatConns.push(ws);
  chats.set(chatId, chatConns);
}
