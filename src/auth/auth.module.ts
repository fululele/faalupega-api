import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { PasswordModule } from "./password.module";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { SessionsController } from "./sessions.controller";

@Module({
  imports: [
    UserModule,
    PasswordModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "change-me-in-production"),
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [SessionsController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
