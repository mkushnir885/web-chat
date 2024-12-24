import { db } from "../../config.js";

export default class Chat {
  static async getById(id) {
    const [chat] = await db.select("chat").where({ id }).run();
    return chat;
  }

  static async getByName(name) {
    const [chat] = await db.select("chat").where({ name }).run();
    return chat;
  }

  static async create(name, userId) {
    const creationReport = await db
      .add("chat")
      .fields(["name"])
      .setValues([name])
      .run();
    const id = creationReport.insertId;
    await Chat.joinById(id, userId);
    return id;
  }

  static async renameById(id, newName) {
    await db
      .update("chat")
      .fields(["name"])
      .setValues([newName])
      .where({ id })
      .run();
  }

  static async joinById(id, userId) {
    await db
      .add("chatUser")
      .fields(["chatId", "userId"])
      .setValues([id, userId])
      .run();
  }

  static async joinByName(name, userId) {
    await Chat.joinById(Chat.getByName(name).id, userId);
  }

  static async exitById(id, userId) {
    await db.remove("chatUser").where({ chatId: id, userId }).run();
  }
}
