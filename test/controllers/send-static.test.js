import {
  afterAll,
  beforeAll,
  describe,
  expect, test,
} from '@jest/globals';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import sendStatic from '../../lib/controllers/send-static.js';

const getReqInstance = (url) => ({ url });

const getResInstance = () => ({
  headers: new Map(),
  setHeader(name, value) {
    this.headers.set(name, value);
  },
  end(data) {
    this.body = data;
  },
});

describe('Controller sendStatic', () => {
  beforeAll(() => {
    mkdirSync('./test/public');
  });

  afterAll(() => {
    rmSync('./test/public', { recursive: true, force: true });
  });

  test('existing known file', async () => {
    writeFileSync('./test/public/index.html', 'Some html');
    const req = getReqInstance('/../test/public/index.html');
    const res = getResInstance();

    await sendStatic({ req, res });

    expect(res.statusCode).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/html');
    expect(res.body).toBe('Some html');
  });

  test('existing unknown file', async () => {
    writeFileSync('./test/public/music.mp3', 'Some sound');
    const req = getReqInstance('/../test/public/music.mp3');
    const res = getResInstance();

    await sendStatic({ req, res });

    expect(res.statusCode).toBe(200);
    expect(res.headers.get('Content-Type')).toBeUndefined();
    expect(res.body).toBe('Some sound');
  });

  test('non-existent file', async () => {
    const req = getReqInstance('/../test/public/script.js');
    const res = getResInstance();

    await sendStatic({ req, res });

    expect(res.statusCode).toBe(404);
    expect(res.body).toBe('File script.js not found');
  });
});
