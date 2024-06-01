import querystring from 'node:querystring';

export default class SubRouter {
  constructor() {
    this.routes = new Map([
      ['GET', new Map()],
      ['POST', new Map()],
      ['PATCH', new Map()],
      ['DELETE', new Map()],
    ]);
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

  getHandler(req) {
    const { method } = req;
    const route = this.parseUrl(req);
    if (route) return this.routes.get(method).get(route);
    return undefined;
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
