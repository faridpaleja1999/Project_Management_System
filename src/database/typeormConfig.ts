import { DataSource, DataSourceOptions } from "typeorm";

import {
  MYSQL_CONNECTION,
  MYSQL_HOST,
  MYSQL_DB,
  MYSQL_PASSWORD,
  MYSQL_PORT,
  MYSQL_USER,
  NODE_ENV,
} from "../configs/config";

let baseFolder = "src";
baseFolder = NODE_ENV == "production" ? "build" : "src";

const typeormConfig = {
  type: MYSQL_CONNECTION,
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  username: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB,
  synchronize: true, //keep true just for development
  entities: [`${baseFolder}/entities/*{.js,.ts}`],
  migrations: [`${baseFolder}/database/seeds/*{.js,.ts}`],
  subscribers: [`${baseFolder}/database/subscriber/**/*{.js,.ts}`],
  migrationsTableName: "seed",
} as DataSourceOptions;

const AppDataSource = new DataSource(typeormConfig);

export default AppDataSource;
