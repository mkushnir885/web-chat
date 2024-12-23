export default class Router {
  constructor(subRoutersMap) {
    this.subRoutersMap = Router.sortSubRouters(subRoutersMap);
  }

  getHandler(req) {
    const { url } = req;
    const baseUrl = this.findBaseUrl(url);
    const subRouter = this.subRoutersMap.get(baseUrl);
    const newUrl = url.slice(baseUrl.length);
    req.url = newUrl.startsWith("/") ? newUrl : `/${newUrl}`;
    const handler = subRouter.getHandler(req);
    if (handler) return handler;
    req.url = url;
    return undefined;
  }

  static sortSubRouters(subRoutersMap) {
    // The more parts the base URL has,
    // the higher the corresponding sub-router will be in the map
    return new Map(
      [...subRoutersMap.entries()].sort(([baseUrlA], [baseUrlB]) => {
        const aPartsCount = baseUrlA.split("/").filter(Boolean).length;
        const bPartsCount = baseUrlB.split("/").filter(Boolean).length;
        return bPartsCount - aPartsCount;
      }),
    );
  }

  findBaseUrl(url) {
    return Array.from(this.subRoutersMap.keys()).find((baseUrl) =>
      url.startsWith(baseUrl),
    );
  }
}
