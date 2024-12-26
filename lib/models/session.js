import Model from "./model.js";

export default class Session extends Model {
  constructor(database) {
    super(database);
  }

  async getByToken(token) {
    const [session] = await this.db.select("session").where({ token }).run();
    return session;
  }

  async saveByToken(token, json) {
    await this.db
      .replace("session")
      .fields(["token", "data"])
      .setValues([token, json])
      .run();
  }

  async deleteByToken(token) {
    await this.db.delete("session").where({ token }).run();
  }
}
