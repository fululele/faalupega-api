import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import mysql from "mysql2/promise";
import { MYSQL_POOL } from "./database.constants";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MYSQL_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return mysql.createPool({
          host: config.get<string>("DB_HOST", "localhost"),
          port: config.get<number>("DB_PORT", 3306),
          user: config.get<string>("DB_USER", "faalupega"),
          password: config.get<string>("DB_PASSWORD", "faalupega"),
          database: config.get<string>("DB_NAME", "faalupega"),
          waitForConnections: true,
          connectionLimit: 10,
        });
      },
    },
  ],
  exports: [MYSQL_POOL],
})
export class DatabaseModule {}
