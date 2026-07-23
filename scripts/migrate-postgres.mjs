import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schema = await readFile(path.join(root, "render", "postgres-schema.sql"), "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
});

await client.connect();
try {
  await client.query(schema);
  console.log("Render PostgreSQL schema is ready.");
} finally {
  await client.end();
}
