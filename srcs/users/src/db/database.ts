import { env } from "config.js"; 
import path from "node:path";
import fs from 'fs';
import { logger } from "index.js";
import Database from "better-sqlite3";

const DB_DIR = path.join(process.cwd(), env.UM_DB_PATH);
const DB_PATH = path.join(DB_DIR, env.UM_DB_NAME);

try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true});
    logger.info({ message: `UM DB ensured ar ${DB_DIR}`});
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const e = new Error(`Failed to create DB directory : ${message}`);
    logger.fatal({ message: e.message, error: e });
    throw e;
}

const db = new Database(DB_PATH);

// user id
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS ${env.UM_DB_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT UNIQUE,
            avatar_url TEXT
        );
    `);
    logger.info({ message: `UM DB schema initialized`});
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const e = new Error(`Failed to initialize DB schema : ${message}`);
    logger.fatal({ message: e.message, error: e });
    throw e;
}