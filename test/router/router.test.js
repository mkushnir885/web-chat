import { describe, expect, test } from '@jest/globals';
import Router from '../../lib/router/router.js';
import SubRouter from '../../lib/router/sub-router.js';

describe('Module Router', () => {
  const rootSubRouter = new SubRouter();
  rootSubRouter.get('/', async (req, res) => {
    res.statusCode = 200;
  });

  const chatSubRouter = new SubRouter();
  chatSubRouter.get('/', async (req, res) => {
    res.statusCode = 200;
  });

  const chatRouter = new Router(new Map([
    ['/', chatSubRouter],
  ]));

  const router = new Router(new Map([
    ['/', rootSubRouter],
    ['/chat', chatRouter],
  ]));

  test('get handler directly', async () => {
    const req = { method: 'GET', url: '/' };
    const res = {};

    const handler = router.getHandler(req);
    await handler(req, res);

    expect(res.statusCode).toBe(200);
  });

  test('get handler indirectly', async () => {
    const req = { method: 'GET', url: '/chat' };
    const res = {};

    const handler = router.getHandler(req);
    await handler(req, res);

    expect(res.statusCode).toBe(200);
  });

  test('no handler', () => {
    const req = { method: 'GET', url: '/chat.html' };

    const handler = router.getHandler(req);

    expect(handler).toBe(undefined);
  });
});
