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

  async updateById(id, data) {
    const dataToUpdate = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => ["nickname", "password"].includes(key) && value,
      ),
    );
    if (Object.keys(dataToUpdate).length === 0) {
      return;
    }

    await this.db
      .update("user")
      .fields(Object.keys(dataToUpdate))
      .setValues(Object.values(dataToUpdate))
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
