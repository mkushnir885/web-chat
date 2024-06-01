import { extname } from 'node:path';
import querystring from 'node:querystring';
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
    const route = this.parseUrl(req);
    if (route) {
      const handler = this.routes.get(method).get(route);
      return handler(req, res);
    }
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

  parseUrl(req) {
    const { method, url } = req;
    const [urlPath, urlQuery] = url.split('?');
    req.query = urlQuery ? querystring.parse(urlQuery) : {};
    req.params = {};
    const pathParts = urlPath.split('/');
    const routes = this.routes.get(method);
    const matchedRoute = Array.from(routes.keys()).find((route) => {
      const routeParts = route.split('/');
      return routeParts.every((part, i) => (part.startsWith(':') ? true : part === pathParts[i]));
    });
    if (matchedRoute) {
      const routeParts = matchedRoute.split('/');
      routeParts.forEach((part, i) => {
        if (part.startsWith(':')) {
          const paramName = part.slice(1);
          req.params[paramName] = pathParts[i];
        }
      });
      return matchedRoute;
    }
    return '';
  }
}

const router = new Router();
export default router;
