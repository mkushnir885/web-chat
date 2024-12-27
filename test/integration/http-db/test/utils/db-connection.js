import "dotenv/config";

import Logger from "../../../../../lib/logger/logger.js";
import initDb from "../../../../../lib/database/database.js";

export const openDbConn = () => {
  const logger = new Logger({ useConsole: true });
  return initDb(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
    },
    logger,
  );
};

export const closeDbConn = async (db) => {
  await db.close();
};
