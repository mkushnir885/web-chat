import init from './database.js';

export default init({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'web_chat',
  password: process.env.DB_PASS || '',
}, console);
