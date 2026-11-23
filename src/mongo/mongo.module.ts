import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoClient } from "mongodb";
import { MONGO_DB } from "./mongo.constants";

@Global()
@Module({
  providers: [
    {
      provide: MONGO_DB,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const url = config.get<string>("MONGO_URL");
        if (!url) {
          new Logger("MongoModule").warn("MONGO_URL not set; MongoDB disabled");
          return null;
        }
        const client = new MongoClient(url);
        await client.connect();
        // Database name comes from the URL path if present, else MONGO_DB_NAME.
        return client.db(config.get<string>("MONGO_DB_NAME") || undefined);
      },
    },
  ],
  exports: [MONGO_DB],
})
export class MongoModule {}
