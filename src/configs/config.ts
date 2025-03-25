import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;

export const MYSQL_CONNECTION = process.env.MYSQL_CONNECTION;
export const MYSQL_HOST = process.env.MYSQL_HOST;
export const MYSQL_PORT = process.env.MYSQL_PORT;
export const MYSQL_USER = process.env.MYSQL_USER;
export const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
export const MYSQL_DB = process.env.MYSQL_DB;

export const JWT_KEY = process.env.JWT_KEY || "didfudiudiudiucudus";
export const ACCESS_TOKEN_LIFETIME = process.env.ACCESS_TOKEN_LIFETIME  || "1h";

export const BCRYPT_HASH_ROUND = process.env.BCRYPT_HASH_ROUND || 10;

