import { db } from "../../../config.js";

class SessionStorage extends Map {
  async get(token) {
    if (super.has(token)) return super.get(token);
    const [sessionObj] = await db.select("session").where({ token }).run();
    if (sessionObj) return new Map(Object.entries(sessionObj.data));
    return undefined;
  }

  async save(token) {
    const session = super.get(token);
    if (session) {
      const obj = Object.fromEntries(session.entries());
      const json = JSON.stringify(obj);
      await db
        .replace("session")
        .fields(["token", "data"])
        .setValues([token, json])
        .run();
    }
  }

  async delete(token) {
    super.delete(token);
    await db.delete("session").where({ token }).run();
  }
}

export default () => new SessionStorage();
