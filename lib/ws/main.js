import initServer from "./server.js";
import { db, logger } from "../config.js";

initServer(db, logger);
