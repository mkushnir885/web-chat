import Model from "./model.js";

export default class Message extends Model {
  constructor(database) {
    super(database);
  }

  async getById(id) {
    const [message] = await this.db.select("message").where({ id }).run();
    return message;
  }

  async getByContent(content) {
    const [message] = await this.db
      .select("message")
      .where({ body: content })
      .run();
    return message;
  }

  async create({ body, timestamp, userId, chatId }) {
    const creationReport = await this.db
      .add("message")
      .fields(["body", "timestamp", "userId", "chatId"])
      .setValues([body, timestamp, userId, chatId])
      .run();
    return creationReport.insertId;
  }

  async deleteById(id) {
    await this.db.delete("message").where({ id }).run();
  }
}
