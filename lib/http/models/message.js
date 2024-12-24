import { db } from "../../config.js";

export default class Message {
  static async getById(id) {
    const [message] = await db.select("message").where({ id }).run();
    return message;
  }

  static async getByContent(content) {
    const [message] = await db.select("message").where({ body: content }).run();
    return message;
  }

  static async create({ body, timestamp, authorId, chatId }) {
    const creationReport = await db
      .add("message")
      .fields(["body", "timestamp", "userId", "chatId"])
      .setValues([body, timestamp, authorId, chatId])
      .run();
    return creationReport.insertId;
  }

  static async deleteById(id) {
    await db.delete("message").where({ id }).run();
  }
}
