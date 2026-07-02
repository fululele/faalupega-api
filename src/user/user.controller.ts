import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SessionResponse } from "../common/types";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CreateUserDto): Promise<SessionResponse> {
    return this.userService.register(dto);
  }
}
