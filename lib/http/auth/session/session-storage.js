class SessionStorage extends Map {
  async get(token, sessionModel) {
    if (super.has(token)) return super.get(token);
    const [sessionObj] = await sessionModel.getByToken(token);
    if (sessionObj) return new Map(Object.entries(sessionObj.data));
    return undefined;
  }

  async save(token, sessionModel) {
    const session = super.get(token);
    if (session) {
      const obj = Object.fromEntries(session.entries());
      const json = JSON.stringify(obj);
      await sessionModel.saveByToken(token, json);
    }
  }

  async delete(token, sessionModel) {
    super.delete(token);
    await sessionModel.deleteByToken(token);
  }
}

export default () => new SessionStorage();
