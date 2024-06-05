export default class User {
  static async create({ nickname, password }) {
    throw new Error('Not implemented');
  }

  static async getById(id) {
    throw new Error('Not implemented');
  }

  static async getByNickname(nickname) {
    throw new Error('Not implemented');
  }

  static async updateById(id, { nickname, password }) {
    throw new Error('Not implemented');
  }

  static async deleteById(id) {
    throw new Error('Not implemented');
  }
}
