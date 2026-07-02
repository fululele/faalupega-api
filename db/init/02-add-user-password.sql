-- Run manually if your database was created before password support:
-- docker exec -i faalupega-mysql mysql -ufaalupega -pfaalupega faalupega < db/init/02-add-user-password.sql

ALTER TABLE User
  ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER person_id;
