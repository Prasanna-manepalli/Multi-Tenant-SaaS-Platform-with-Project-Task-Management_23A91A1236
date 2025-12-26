import bcrypt from "bcrypt";
import { pool } from "./index.js";
import { v4 as uuid } from "uuid";

const password = await bcrypt.hash("Admin@123", 10);

await pool.query(`
INSERT INTO users (id, email, password, role, tenant_id)
VALUES ($1, $2, $3, 'super_admin', NULL)
ON CONFLICT DO NOTHING
`, [uuid(), "superadmin@system.com", password]);

console.log("Seed data inserted");
