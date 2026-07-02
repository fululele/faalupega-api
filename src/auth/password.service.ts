import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, this.saltRounds);
  }

  async compare(
    plainTextPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, passwordHash);
  }
}
