import { createHash } from "node:crypto";
import Model from "./model.js";

export const hashPassword = (password) =>
  createHash("sha256").update(password).digest("hex");

export default class User extends Model {
  constructor(database) {
    super(database);
  }

  async getById(id) {
    const [user] = await this.db.select("user").where({ id }).run();
    return user;
  }

  async getByNickname(nickname) {
    const [user] = await this.db.select("user").where({ nickname }).run();
    return user;
  }

  async create({ nickname, password }) {
    const hash = hashPassword(password);
    const creationReport = await this.db
      .add("user")
      .fields(["nickname", "password"])
      .setValues([nickname, hash])
      .run();
    return creationReport.insertId;
  }

  async updateById(id, updatedData) {
    await this.db
      .update("user")
      .fields(Object.keys(updatedData))
      .setValues(Object.values(updatedData))
      .where({ id })
      .run();
  }

  async deleteById(id) {
    await this.db.delete("user").where({ id }).run();
  }

  async getChatIdsById(id) {
    const userChats = await this.db
      .select("chatUser")
      .where({ userId: id })
      .run();
    return userChats.map(({ chatId }) => chatId);
  }
}
