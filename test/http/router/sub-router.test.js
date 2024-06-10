import { describe, expect, test } from '@jest/globals';
import SubRouter from '../../../lib/http/router/sub-router.js';

describe('Module SubRouter', () => {
  const subRouter = new SubRouter();

  test('add new GET-handler', async () => {
    subRouter.get('/', async (req, res) => {
      res.statucCode = 200;
    });
    const req = { method: 'GET', url: '/' };
    const res = {};

    const handler = subRouter.getHandler(req);
    await handler(req, res);

    expect(res.statucCode).toBe(200);
  });

  test('add new POST-handler', async () => {
    subRouter.post('/', async (req, res) => {
      res.statucCode = 200;
    });
    const req = { method: 'POST', url: '/' };
    const res = {};

    const handler = subRouter.getHandler(req);
    await handler(req, res);

    expect(res.statucCode).toBe(200);
  });

  test('add new PATCH-handler', async () => {
    subRouter.patch('/', async (req, res) => {
      res.statucCode = 200;
    });
    const req = { method: 'PATCH', url: '/' };
    const res = {};

    const handler = subRouter.getHandler(req);
    await handler(req, res);

    expect(res.statucCode).toBe(200);
  });

  test('add new DELETE-handler', async () => {
    subRouter.delete('/', async (req, res) => {
      res.statucCode = 200;
    });
    const req = { method: 'DELETE', url: '/' };
    const res = {};

    const handler = subRouter.getHandler(req);
    await handler(req, res);

    expect(res.statucCode).toBe(200);
  });

  test('no handler', () => {
    const req = { method: 'GET', url: '/index.html' };

    const handler = subRouter.getHandler(req);

    expect(handler).toBeUndefined();
  });

  test('parse URL', async () => {
    subRouter.get('/chat/private/:id/action', async (req, res) => {
      res.body = `${req.params.id} ${req.query.foo}`;
    });
    const req = { method: 'GET', url: '/chat/private/12345/action?foo=baz' };
    const res = {};

    const handler = subRouter.getHandler(req);
    await handler(req, res);

    expect(res.body).toBe('12345 baz');
  });
});
