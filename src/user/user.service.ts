import {
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PasswordService } from "../auth/password.service";
import { formatFullName } from "../common/name.utils";
import {
  AuthUserResponse,
  SessionResponse,
  UserWithPerson,
} from "../common/types";
import { PersonRepository } from "../person/person.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<SessionResponse> {
    const email = dto.email.trim().toLowerCase();
    const existingPerson = await this.personRepository.findByEmail(email);

    if (existingPerson) {
      throw new ConflictException("An account with this email already exists.");
    }

    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();
    const passwordHash = await this.passwordService.hash(dto.password);
    const person = await this.personRepository.create(firstName, lastName, email);
    const user = await this.userRepository.create(
      person.person_id,
      passwordHash,
      "active",
    );

    const record: UserWithPerson = {
      ...user,
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
    };

    return this.buildSession(record);
  }

  private buildSession(record: UserWithPerson): SessionResponse {
    const user = this.toAuthUser(record);
    const token = this.jwtService.sign({
      sub: user.userId,
      personId: user.personId,
      email: user.email,
    });

    return { user, token };
  }

  toAuthUser(record: UserWithPerson): AuthUserResponse {
    return {
      userId: record.user_id,
      personId: record.person_id,
      firstName: record.first_name,
      lastName: record.last_name,
      name: formatFullName(record.first_name, record.last_name),
      email: record.email,
      status: record.status,
    };
  }
}
