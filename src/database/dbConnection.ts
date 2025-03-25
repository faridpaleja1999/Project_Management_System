import { DataSource } from "typeorm";
import AppDataSource from "./typeormConfig";

export default class Database {
  static #instance: Database;

  #connection?: DataSource;

  constructor() {
    if (Database.#instance instanceof Database) {
      return Database.#instance;
    }
    Database.#instance = this;
  }

  async connect(): Promise<DataSource> {
    [this.#connection] = await Promise.all([AppDataSource.initialize()]);
    return this.#connection;
  }

  async disConnect(): Promise<void> {
    if (this.#connection) {
      await this.#connection.destroy();
    }
  }
}
