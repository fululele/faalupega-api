import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import mysql from "mysql2/promise";
import { MYSQL_POOL } from "./database.constants";

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function isSet(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function readIndividualVars(config: ConfigService): DatabaseConfig {
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

  return {
    host: get(["DB_HOST", "MYSQLHOST"], "localhost"),
    port: Number(portRaw),
    user: get(["DB_USER", "MYSQLUSER"], "faalupega"),
    password: get(["DB_PASSWORD", "MYSQLPASSWORD"], "faalupega"),
    database: get(["DB_NAME", "MYSQLDATABASE"], "faalupega"),
  };
}

function readUrlVar(config: ConfigService): DatabaseConfig | null {
  const mysqlUrl =
    config.get<string>("MYSQL_URL")?.trim() ||
    config.get<string>("DATABASE_URL")?.trim();

  if (!mysqlUrl?.startsWith("mysql")) {
    return null;
  }

  const url = new URL(mysqlUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  };
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MYSQL_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger("DatabaseModule");
        const fromUrl = readUrlVar(config);
        const dbConfig = fromUrl ?? readIndividualVars(config);
        const isProduction = config.get<string>("NODE_ENV") === "production";

        logger.log(
          "DB env present: " +
            `DB_HOST=${isSet(config.get("DB_HOST"))}, ` +
            `MYSQLHOST=${isSet(config.get("MYSQLHOST"))}, ` +
            `MYSQL_URL=${isSet(config.get("MYSQL_URL"))}, ` +
            `source=${fromUrl ? "MYSQL_URL" : "individual vars"}`,
        );
        logger.log(
          `Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
        );

        if (
          isProduction &&
          (dbConfig.host === "localhost" || dbConfig.host === "127.0.0.1")
        ) {
          logger.error(
            "Database host is localhost in production. Variables on the MySQL service " +
              "are not visible to the API automatically. On the API service, add a " +
              "reference such as MYSQL_URL=${{YourMySQLServiceName.MYSQL_URL}}.",
          );
        }

        return mysql.createPool({
          ...dbConfig,
          waitForConnections: true,
          connectionLimit: 10,
        });
      },
    },
  ],
  exports: [MYSQL_POOL],
})
export class DatabaseModule {}
