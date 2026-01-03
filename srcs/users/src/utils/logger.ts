import pino from 'pino';
import { loggerConfig } from 'src/config/logger.config.js';

export const logger = pino(loggerConfig);
