import { db } from "../../config.js";
import sendEvent from "../send-event.js";

export default async function handleUserOnline(ws, { user }, users, chats) {
  users.set(ws, user);
  const userChats = await db
    .select("chatUser")
    .where({ userId: user.id })
    .run();

  userChats.forEach(({ chatId }) => {
    const chatConns = chats.get(chatId) || [];
    chatConns.push(ws);
    chats.set(chatId, chatConns);
  });

  const messages = await Promise.all(
    userChats.map(async ({ chatId }) => {
      const chatMessages = await db.select("message").where({ chatId });
      return [
        chatId,
        await Promise.all(
          chatMessages.map(async (msg) => {
            const [{ nickname }] = await db
              .select("user")
              .fields(["nickname"])
              .where({ id: msg.userId })
              .run();
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
