import { Module } from "@nestjs/common";
import { PersonRepository } from "./person.repository";

@Module({
  providers: [PersonRepository],
  exports: [PersonRepository],
})
export class PersonModule {}
