import { Inject, Injectable } from "@nestjs/common";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { PersonRecord } from "../common/types";
import { MYSQL_POOL } from "../database/database.constants";

interface PersonRow extends PersonRecord, RowDataPacket {}

@Injectable()
export class PersonRepository {
  constructor(@Inject(MYSQL_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<PersonRecord | null> {
    const [rows] = await this.pool.query<PersonRow[]>(
      "SELECT person_id, first_name, last_name, email FROM Person WHERE email = ? LIMIT 1",
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(personId: number): Promise<PersonRecord | null> {
    const [rows] = await this.pool.query<PersonRow[]>(
      "SELECT person_id, first_name, last_name, email FROM Person WHERE person_id = ? LIMIT 1",
      [personId],
    );
    return rows[0] ?? null;
  }

  async create(
    firstName: string,
    lastName: string,
    email: string,
  ): Promise<PersonRecord> {
    const [result] = await this.pool.query<ResultSetHeader>(
      "INSERT INTO Person (first_name, last_name, email) VALUES (?, ?, ?)",
      [firstName, lastName, email],
    );

    const person = await this.findById(result.insertId);
    if (!person) {
      throw new Error("Failed to load person after insert.");
    }
    return person;
  }
}
