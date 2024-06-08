import openDb from './database.js';

export const db = openDb({
  host: 'localhost',
  user: 'root',
  database: 'web-chat',
  password: '',
}, console);

export default {
  db,
};
