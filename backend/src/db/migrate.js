import { pool } from "./index.js";

await pool.query(`
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY,
  name TEXT,
  subdomain TEXT UNIQUE,
  status TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,
  tenant_id UUID
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  name TEXT,
  tenant_id UUID
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  title TEXT,
  project_id UUID
);
`);

console.log("Migrations completed");
