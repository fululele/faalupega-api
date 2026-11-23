import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { UserModule } from "./user/user.module";
import { MongoModule } from "./mongo/mongo.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      ignoreEnvFile: false,
      expandVariables: true,
    }),
    DatabaseModule,
    MongoModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
