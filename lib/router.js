import { extname } from 'node:path';
import readStaticFile from './read-static-file.js';

const fileTypes = {
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

class Router {
  constructor() {
    this.routes = new Map([
      ['GET', new Map()],
      ['POST', new Map()],
      ['PATCH', new Map()],
      ['DELETE', new Map()],
    ]);
    this.staticDir = '';
  }

  get(route, handler) {
    this.routes.get('GET').set(route, handler);
  }

  post(route, handler) {
    this.routes.get('POST').set(route, handler);
  }

  patch(route, handler) {
    this.routes.get('PATCH').set(route, handler);
  }

  delete(route, handler) {
    this.routes.get('DELETE').set(route, handler);
  }

  async static(url, res) {
    const relPath = this.staticDir + url;
    try {
      const fileContent = await readStaticFile(relPath);
      const contentType = fileTypes[extname(relPath)];
      res.writeHead(200, { ContentType: contentType });
      res.end(fileContent);
    } catch (err) {
      res.statusCode = err.statusCode || 500;
      res.end(err.message);
    }
  }

  handler(req, res) {
    const { method, url } = req;
    // TODO: implement url parsing
    const route = url;

    const handler = this.routes.get(method).get(route);
    if (handler) return handler(req, res);
    if (method === 'GET') {
      const ext = extname(url);
      if (Object.keys(fileTypes).includes(ext)) {
        return this.static(req.url, res);
      }
    }
    return async () => {
      res.statusCode = 501;
      res.end('Not Implemented');
    };
  }
}

const router = new Router();
export default router;
