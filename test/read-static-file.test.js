import {
  afterAll,
  beforeAll,
  describe,
  expect, test,
} from '@jest/globals';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import readStaticFile from '../lib/read-static-file.js';

describe('Function getStaticFile', () => {
  beforeAll(() => {
    mkdirSync('./test/public');
    writeFileSync('./test/public/existing.html', 'Some html');
  });

  afterAll(() => {
    rmSync('./test/public', { recursive: true, force: true });
  });

  test('existing file', () => {
    readStaticFile('test/public/existing.html').then(
      (fileContent) => expect(fileContent).toBe('Some html'),
      (err) => expect(err).toBeNull(),
    );
  });

  test('non-existent file', async () => {
    try {
      await readStaticFile('test/public/non-existent.html');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      const { statusCode, message } = err;
      expect(statusCode).toBe(404);
      expect(message).toBe('File non-existent.html not found');
    }
  });
});
