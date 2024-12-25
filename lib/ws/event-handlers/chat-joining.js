export default async function handleChatJoining(ws, { chatId }, chats) {
  const chatConns = chats.get(chatId) || [];
  chatConns.push(ws);
  chats.set(chatId, chatConns);
}
