import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PasswordService } from "./password.service";
import { AuthUserResponse, SessionResponse } from "../common/types";
import { UserRepository } from "../user/user.repository";
import { UserService } from "../user/user.service";
import { CreateSessionDto } from "./dto/create-session.dto";

interface JwtPayload {
  sub: number;
  personId: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: CreateSessionDto): Promise<SessionResponse> {
    const email = dto.email.trim().toLowerCase();
    const record = await this.userRepository.findByEmail(email);

    if (
      !record ||
      !record.password_hash ||
      !(await this.passwordService.compare(dto.password, record.password_hash))
    ) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (record.status !== "active") {
      throw new UnauthorizedException("This account is inactive.");
    }

    const user = this.userService.toAuthUser(record);
    const token = this.jwtService.sign({
      sub: user.userId,
      personId: user.personId,
      email: user.email,
    });

    return { user, token };
  }

  async getCurrentUser(userId: number): Promise<AuthUserResponse> {
    const record = await this.userRepository.findByUserId(userId);

    if (!record) {
      throw new UnauthorizedException("Session is invalid.");
    }

    if (record.status !== "active") {
      throw new UnauthorizedException("This account is inactive.");
    }

    return this.userService.toAuthUser(record);
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException("Session is invalid or expired.");
    }
  }
}
