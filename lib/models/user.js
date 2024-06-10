import { createHash } from 'node:crypto';
import db from '../init-db.js';

export default class User {
  static async getById(id) {
    const [user] = await db.select('user').where({ id }).run();
    return user;
  }

  static async getByNickname(nickname) {
    const [user] = await db.select('user').where({ nickname }).run();
    return user;
  }

  static async create({ nickname, password }) {
    const hash = this.hashPassword(password);
    const creationReport = await db
      .add('user')
      .fields(['nickname', 'password'])
      .setValues([nickname, hash])
      .run();
    return creationReport.insertId;
  }

  static async updateById(id, updatedData) {
    await db
      .update('user')
      .fields(Object.keys(updatedData))
      .setValues(Object.values(updatedData))
      .where({ id })
      .run();
  }

  static async deleteById(id) {
    await db.delete('user').where({ id }).run();
  }

  static hashPassword(password) {
    return createHash('sha256').update(password).digest('hex');
  }
}
