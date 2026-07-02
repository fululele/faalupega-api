import { Inject, Injectable } from "@nestjs/common";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { UserRecord, UserStatus, UserWithPerson } from "../common/types";
import { MYSQL_POOL } from "../database/database.constants";

interface UserRow extends UserRecord, RowDataPacket {}

interface UserWithPersonRow extends UserWithPerson, RowDataPacket {}

@Injectable()
export class UserRepository {
  constructor(@Inject(MYSQL_POOL) private readonly pool: Pool) {}

  async findByPersonId(personId: number): Promise<UserRecord | null> {
    const [rows] = await this.pool.query<UserRow[]>(
      "SELECT user_id, person_id, password_hash, status FROM User WHERE person_id = ? LIMIT 1",
      [personId],
    );
    return rows[0] ?? null;
  }

  async findByUserId(userId: number): Promise<UserWithPerson | null> {
    const [rows] = await this.pool.query<UserWithPersonRow[]>(
      `SELECT u.user_id, u.person_id, u.password_hash, u.status,
              p.first_name, p.last_name, p.email
       FROM User u
       INNER JOIN Person p ON p.person_id = u.person_id
       WHERE u.user_id = ?
       LIMIT 1`,
      [userId],
    );
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserWithPerson | null> {
    const [rows] = await this.pool.query<UserWithPersonRow[]>(
      `SELECT u.user_id, u.person_id, u.password_hash, u.status,
              p.first_name, p.last_name, p.email
       FROM User u
       INNER JOIN Person p ON p.person_id = u.person_id
       WHERE p.email = ?
       LIMIT 1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async create(
    personId: number,
    passwordHash: string,
    status: UserStatus = "active",
  ): Promise<UserRecord> {
    const [result] = await this.pool.query<ResultSetHeader>(
      "INSERT INTO User (person_id, password_hash, status) VALUES (?, ?, ?)",
      [personId, passwordHash, status],
    );

    const user = await this.findByUserId(result.insertId);
    if (!user) {
      throw new Error("Failed to load user after insert.");
    }

    return {
      user_id: user.user_id,
      person_id: user.person_id,
      password_hash: user.password_hash,
      status: user.status,
    };
  }
}
