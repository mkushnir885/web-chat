import sessionStorage from './session-storage.js';
import User from './models/user.js';

const TOKEN_LENGTH = 32;
const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA = ALPHA_UPPER + ALPHA_LOWER;
const DIGIT = '0123456789';
const ALPHA_DIGIT = ALPHA + DIGIT;

const generateToken = () => {
  const base = ALPHA_DIGIT.length;
  let key = '';
  for (let i = 0; i < TOKEN_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * base);
    key += ALPHA_DIGIT[index];
  }
  return key;
};

export default class Session extends Map {
  constructor(token) {
    super();
    this.token = token;
  }

  static start(client) {
    if (client.session) return client.session;
    const token = generateToken();
    const session = new Session(token);
    client.updateSession(token, session);
    client.setCookie('token', token);
    sessionStorage.set(token, session);
    return session;
  }

  static restore(client) {
    const { cookie } = client;
    if (!cookie) return Promise.reject(new Error('No cookie'));
    const sessionToken = cookie.token;
    if (!sessionToken) return Promise.reject(new Error('No session token in cookie'));
    return new Promise((resolve, reject) => {
      sessionStorage.get(sessionToken, async (err, session) => {
        if (err) {
          reject(new Error('No session'));
        } else {
          Object.setPrototypeOf(session, Session.prototype);
          client.updateSession(sessionToken, session);
          const user = await User.getById(session.get('userId'));
          client.update('user', user);
          resolve(session);
        }
      });
    });
  }

  static delete(client) {
    const { token } = client;
    if (token) {
      client.deleteCookie('token');
      client.updateSession(undefined, null);
      sessionStorage.delete(token);
    }
  }

  save() {
    sessionStorage.save(this.token);
  }
}
