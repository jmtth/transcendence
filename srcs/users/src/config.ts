import { bool, cleanEnv, num, str } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
  LOG_ENABLED: bool( {default: true}),
  LOG_LEVEL: str({choices: ['debug', 'info', 'warn', 'error'], default: 'info'}),
  PORT: num( {default: 3003} ),
  UM_DB_PATH: str({default: "./data/um"}),
  UM_DB_NAME: str({default: "um.db"}), 
});