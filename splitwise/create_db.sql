CREATE DATABASE IF NOT EXISTS splitwise_dummy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE splitwise_dummy;

-- With JPA `ddl-auto=update`, the table will be created automatically.
-- But here's a small compatible table definition if you prefer to create it manually:

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255),
  amount DECIMAL(10,2),
  paid_by VARCHAR(255),
  participants VARCHAR(1024),
  date DATE
);

ALTER TABLE expenses ADD COLUMN settled BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN splits TEXT NULL;