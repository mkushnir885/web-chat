import Model from "./model.js";

export default class Chat extends Model {
  constructor(database) {
    super(database);
  }

  async getById(id) {
    const [chat] = await this.db.select("chat").where({ id }).run();
    return chat;
  }

  async getByName(name) {
    const [chat] = await this.db.select("chat").where({ name }).run();
    return chat;
  }

  async create(name, userId) {
    const creationReport = await this.db
      .add("chat")
      .fields(["name"])
      .setValues([name])
      .run();
    const id = creationReport.insertId;
    await this.joinById(id, userId);
    return id;
  }

  async renameById(id, newName) {
    await this.db
      .update("chat")
      .fields(["name"])
      .setValues([newName])
      .where({ id })
      .run();
  }

  async joinById(id, userId) {
    await this.db
      .add("chatUser")
      .fields(["chatId", "userId"])
      .setValues([id, userId])
      .run();
  }

  async exitById(id, userId) {
    await this.db.delete("chatUser").where({ chatId: id, userId }).run();
  }

  async getMessagesById(id) {
    return this.db.select("message").where({ chatId: id }).run();
  }
}
