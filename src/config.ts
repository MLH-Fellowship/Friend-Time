import { ConfigSchema } from './models/config-models';

const BaseConfig = require('../config/config.json');

const Config: ConfigSchema = {
  ...BaseConfig,
  client: {
    ...BaseConfig.client,
    token: process.env.CLIENT_TOKEN
  },
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT &&
      parseInt(process.env.MYSQL_CONNECTION_LIMIT) ||
      10
  }

};

export default Config;