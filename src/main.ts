import "reflect-metadata";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

config();

function parseCorsOrigins(value: string | undefined): string | string[] {
  const defaultOrigin = "http://localhost:3000";
  const raw = value?.trim() || defaultOrigin;
  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length === 1 ? origins[0] : origins;
}

async function bootstrap() {
  const httpsEnabled = process.env.HTTPS_ENABLED === "true";
  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  const app = await NestFactory.create(AppModule, {
    httpsOptions:
      httpsEnabled && keyPath && certPath
        ? {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          }
        : undefined,
  });

  const appConfig = app.get(ConfigService);
  const isProduction = appConfig.get<string>("NODE_ENV") === "production";

  app.use(
    helmet({
      hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  app.enableCors({
    origin: parseCorsOrigins(appConfig.get<string>("CORS_ORIGIN")),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = appConfig.get<number>("API_PORT", 3001);
  await app.listen(port);
}

bootstrap();
