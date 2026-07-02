export type UserStatus = "active" | "inactive";

export interface PersonRecord {
  person_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface UserRecord {
  user_id: number;
  person_id: number;
  password_hash: string;
  status: UserStatus;
}

export interface UserWithPerson extends UserRecord {
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthUserResponse {
  userId: number;
  personId: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  status: UserStatus;
}

export interface SessionResponse {
  user: AuthUserResponse;
  token: string;
}
