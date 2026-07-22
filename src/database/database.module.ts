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

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "").trim();
}

function readEnv(config: ConfigService, key: string): string | undefined {
  const fromConfig = config.get<string>(key);
  const fromProcess = process.env[key];
  const value = fromConfig ?? fromProcess;
  return value ? stripQuotes(value) : undefined;
}

function readIndividualVars(config: ConfigService): DatabaseConfig {
  const get = (keys: string[], fallback: string): string => {
    for (const key of keys) {
      const value = readEnv(config, key);
      if (value) {
        return value;
      }
    }
    return fallback;
  };

  const portRaw = get(["MYSQLPORT", "DB_PORT"], "3306");

  return {
    host: get(["MYSQLHOST", "DB_HOST"], "localhost"),
    port: Number(portRaw),
    user: get(["MYSQLUSER", "DB_USER"], "faalupega"),
    password: get(["MYSQLPASSWORD", "DB_PASSWORD"], "faalupega"),
    database: get(["MYSQLDATABASE", "DB_NAME"], "faalupega"),
  };
}

function readUrlVar(config: ConfigService): DatabaseConfig | null {
  const logger = new Logger("DatabaseModule");
  const mysqlUrl =
    readEnv(config, "MYSQL_URL") || readEnv(config, "DATABASE_URL");

  if (!isSet(mysqlUrl) || !mysqlUrl!.startsWith("mysql://")) {
    logger.warn(
      `MYSQL_URL/DATABASE_URL is not a valid mysql:// connection string ` +
        `(value=${mysqlUrl ? `"${mysqlUrl}"` : "unset"}). Falling back to individual vars.`,
    );
    return null;
  }

  try {
    const url = new URL(mysqlUrl!);

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
    };
  } catch (error) {
    logger.error(
      `Failed to parse MYSQL_URL/DATABASE_URL as a URL: ${(error as Error).message}`,
    );
    return null;
  }
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
            `MYSQL_URL=${isSet(readEnv(config, "MYSQL_URL"))}, ` +
            `MYSQLHOST=${isSet(readEnv(config, "MYSQLHOST"))}, ` +
            `MYSQLUSER=${isSet(readEnv(config, "MYSQLUSER"))}, ` +
            `MYSQLPASSWORD=${isSet(readEnv(config, "MYSQLPASSWORD"))}, ` +
            `DB_USER=${isSet(readEnv(config, "DB_USER"))}, ` +
            `source=${fromUrl ? "MYSQL_URL" : "individual vars"}`,
        );
        logger.log(
          `Connecting to MySQL as ${dbConfig.user} at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
        );

        if (isProduction && dbConfig.user === "faalupega") {
          logger.error(
            "Using dev default user 'faalupega'. Remove plain-text DB_USER/DB_PASSWORD " +
              "from the API service if present, and keep MYSQL_URL or MYSQLUSER references only.",
          );
        }

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