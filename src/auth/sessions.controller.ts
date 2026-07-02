import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthUserResponse, SessionResponse } from "../common/types";
import { AuthGuard, AuthenticatedRequest } from "./auth.guard";
import { AuthService } from "./auth.service";
import { CreateSessionDto } from "./dto/create-session.dto";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: CreateSessionDto): Promise<SessionResponse> {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  getCurrentSession(
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthUserResponse> {
    return this.authService.getCurrentUser(request.userId!);
  }

  @Delete("me")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): void {
    // JWT sessions are stateless; the client clears the stored token.
  }
}
