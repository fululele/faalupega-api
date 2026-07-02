import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid authorization header.");
    }

    const token = header.slice("Bearer ".length);
    const payload = this.authService.verifyToken(token);
    request.userId = payload.sub;
    return true;
  }
}
