import Logger from './logger/logger.js';
import initDb from './database/database.js';

export const logger = new Logger({ useConsole: true });

export const db = initDb({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'web_chat',
  password: process.env.DB_PASS || '',
}, logger);
