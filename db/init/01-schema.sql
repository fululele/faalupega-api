CREATE TABLE IF NOT EXISTS Person (
  person_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_person_email (email)
);

CREATE TABLE IF NOT EXISTS User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  person_id INT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  CONSTRAINT fk_user_person FOREIGN KEY (person_id) REFERENCES Person (person_id),
  UNIQUE KEY uq_user_person (person_id)
);
