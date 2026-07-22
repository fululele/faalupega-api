import { Global, Logger, Module } from "@nestjs/common";
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
        const logger = new Logger("DatabaseModule");

        const get = (keys: string[], fallback: string): string => {
          for (const key of keys) {
            const value = config.get<string>(key)?.trim();
            if (value) {
              return value;
            }
          }
          return fallback;
        };

        const portRaw = get(["DB_PORT", "MYSQLPORT"], "3306");
        const host = get(["DB_HOST", "MYSQLHOST"], "localhost");
        const database = get(["DB_NAME", "MYSQLDATABASE"], "faalupega");
        const isProduction = config.get<string>("NODE_ENV") === "production";

        logger.log(`Connecting to MySQL at ${host}:${portRaw}/${database}`);

        if (isProduction && (host === "localhost" || host === "127.0.0.1")) {
          logger.error(
            "Database host is localhost in production. Link your Railway MySQL service " +
              "or set DB_HOST=${{YourMySQLServiceName.MYSQLHOST}} (service name must match exactly).",
          );
        }

        return mysql.createPool({
          host,
          port: Number(portRaw),
          user: get(["DB_USER", "MYSQLUSER"], "faalupega"),
          password: get(["DB_PASSWORD", "MYSQLPASSWORD"], "faalupega"),
          database,
          waitForConnections: true,
          connectionLimit: 10,
        });
      },
    },
  ],
  exports: [MYSQL_POOL],
})
export class DatabaseModule {}
