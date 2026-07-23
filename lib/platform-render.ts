import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { SqlStatement, StoredObject } from "@/lib/platform-types";

declare global {
  var __omtPostgresPool: Pool | undefined;
  var __omtS3Client: S3Client | undefined;
}

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured");
  return value;
}

function pool() {
  if (!globalThis.__omtPostgresPool) {
    globalThis.__omtPostgresPool = new Pool({
      connectionString: databaseUrl(),
      max: Number(process.env.PG_POOL_MAX ?? 10),
      ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalThis.__omtPostgresPool;
}

export function toPostgresSql(sql: string) {
  let parameter = 0;
  let quoted: "'" | '"' | null = null;
  let converted = "";

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    if (quoted) {
      converted += character;
      if (character === quoted && sql[index + 1] === quoted) {
        converted += sql[index + 1];
        index += 1;
      } else if (character === quoted) {
        quoted = null;
      }
    } else if (character === "'" || character === '"') {
      quoted = character;
      converted += character;
    } else if (character === "?") {
      converted += `$${++parameter}`;
    } else {
      converted += character;
    }
  }

  return converted;
}

async function runQuery<T extends QueryResultRow>(
  client: Pool | PoolClient,
  sql: string,
  params: unknown[] = [],
) {
  return client.query<T>(toPostgresSql(sql), params);
}

export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await runQuery<T>(pool(), sql, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: unknown[] = []) {
  await runQuery(pool(), sql, params);
}

export async function batch(statements: SqlStatement[]) {
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    for (const statement of statements) {
      await runQuery(client, statement.sql, statement.params ?? []);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function runtimeValue(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function s3Bucket() {
  return runtimeValue("S3_BUCKET");
}

function s3Client() {
  if (globalThis.__omtS3Client) return globalThis.__omtS3Client;

  const accessKeyId = runtimeValue("S3_ACCESS_KEY_ID");
  const secretAccessKey = runtimeValue("S3_SECRET_ACCESS_KEY");
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error("S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be configured together");
  }

  globalThis.__omtS3Client = new S3Client({
    region: runtimeValue("S3_REGION") ?? "auto",
    endpoint: runtimeValue("S3_ENDPOINT"),
    forcePathStyle: runtimeValue("S3_FORCE_PATH_STYLE") === "true",
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
  return globalThis.__omtS3Client;
}

export async function putObject(
  key: string,
  body: Uint8Array,
  metadata: { contentType: string; cacheControl: string },
) {
  const bucket = s3Bucket();
  if (bucket) {
    await s3Client().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: metadata.contentType,
      CacheControl: metadata.cacheControl,
    }));
    return;
  }

  const stableBytes = new Uint8Array(body.byteLength);
  stableBytes.set(body);
  const digest = await crypto.subtle.digest("SHA-256", stableBytes);
  const etag = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  await execute(`
    INSERT INTO proof_objects (object_key, content_type, cache_control, etag, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(object_key) DO NOTHING
  `, [key, metadata.contentType, metadata.cacheControl, etag, Buffer.from(body), new Date().toISOString()]);
}

export async function getObject(key: string): Promise<StoredObject | null> {
  const bucket = s3Bucket();
  if (bucket) {
    const object = await s3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!object.Body) return null;
    const bytes = await object.Body.transformToByteArray();
    return {
      body: Uint8Array.from(bytes).buffer,
      contentType: object.ContentType,
      cacheControl: object.CacheControl,
      etag: object.ETag?.replaceAll('"', ""),
    };
  }

  const row = await queryOne<{
    body: Buffer;
    content_type: string;
    cache_control: string | null;
    etag: string;
  }>("SELECT body, content_type, cache_control, etag FROM proof_objects WHERE object_key = ? LIMIT 1", [key]);
  if (!row) return null;
  return {
    body: Uint8Array.from(row.body).buffer,
    contentType: row.content_type,
    cacheControl: row.cache_control ?? undefined,
    etag: row.etag,
  };
}
