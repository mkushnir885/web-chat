import Session from './session.js';

const UNIX_EPOCH = 'Thu, 01 Jan 1970 00:00:00 GMT';
const COOKIE_EXPIRE = 'Fri, 01 Jan 2100 00:00:00 GMT';
const COOKIE_DELETE = `=deleted; Expires=${UNIX_EPOCH}; Path=/; Domain=`;

const parseHost = (host) => {
  if (!host) return 'no-host-name-in-http-headers';
  const portOffset = host.indexOf(':');
  if (portOffset > -1) return host.substring(0, portOffset);
  return host;
};

export default class Client {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.host = parseHost(req.headers.host);
    this.token = undefined;
    this.session = null;
    this.user = null;
    this.cookie = {};
    this.preparedCookie = [];
    this.parseCookie();
  }

  update(key, value) {
    this[key] = value;
  }

  updateReq(key, value) {
    this.req[key] = value;
  }

  updateRes(key, value) {
    this.res[key] = value;
  }

  static async getInstance(req, res) {
    const client = new Client(req, res);
    await Session.restore(client).catch((err) => console.log(`Cannot restore session (${err.message})`));
    return client;
  }

  updateSession(token, session) {
    this.token = token;
    this.session = session;
  }

  parseCookie() {
    const { req } = this;
    const { cookie } = req.headers;
    if (!cookie) return;
    const items = cookie.split(';');
    items.forEach((item) => {
      const parts = item.split('=');
      const key = parts[0].trim();
      const value = parts[1] || '';
      this.cookie[key] = value.trim();
    });
  }

  setCookie(name, val, httpOnly = false) {
    const { host } = this;
    const expires = `expires=${COOKIE_EXPIRE}`;
    let cookie = `${name}=${val}; ${expires}; Path=/; Domain=${host}`;
    if (httpOnly) cookie += '; HttpOnly';
    this.preparedCookie.push(cookie);
  }

  deleteCookie(name) {
    this.preparedCookie.push(name + COOKIE_DELETE + this.host);
  }

  sendCookie() {
    const { res, preparedCookie } = this;
    if (preparedCookie.length && !res.headersSent) {
      console.dir({ preparedCookie });
      res.setHeader('Set-Cookie', preparedCookie);
    }
  }

  isAuthenticated() {
    return this.user !== null;
  }
}
