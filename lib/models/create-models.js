import User from "./user.js";
import Chat from "./chat.js";
import Message from "./message.js";
import Session from "./session.js";

export default function createModels(database) {
  return {
    user: new User(database),
    chat: new Chat(database),
    message: new Message(database),
    session: new Session(database),
  };
}
