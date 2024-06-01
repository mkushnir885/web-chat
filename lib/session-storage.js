import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import v8 from 'node:v8';

const dirName = path.dirname(fileURLToPath(import.meta.url));
const PATH = `${dirName}/sessions`;

const safePath = (fn) => (token, ...args) => {
  const callback = args[args.length - 1];
  if (typeof token !== 'string') {
    callback(new Error('Invalid session token'));
    return;
  }
  const fileName = path.join(PATH, token);
  if (!fileName.startsWith(PATH)) {
    callback(new Error('Invalid session token'));
    return;
  }
  fn(fileName, ...args);
};

class SessionStorage extends Map {
  get(key, callback) {
    const value = super.get(key);
    if (value) {
      callback(null, value);
      return;
    }
    this.readSession(key, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      console.log(`Session loaded: ${key}`);
      const session = v8.deserialize(data);
      super.set(key, session);
      callback(null, session);
    });
  }

  save(key) {
    const value = super.get(key);
    if (value) {
      const data = v8.serialize(value);
      this.writeSession(key, data, () => {
        console.log(`Session saved: ${key}`);
      });
    }
  }

  delete(key) {
    console.log('Delete: ', key);
    this.deleteSession(key, () => {
      console.log(`Session deleted: ${key}`);
    });
  }

  readSession = safePath(fs.readFile);

  writeSession = safePath(fs.writeFile);

  deleteSession = safePath(fs.unlink);
}

const sessionStorage = new SessionStorage();
export default sessionStorage;
