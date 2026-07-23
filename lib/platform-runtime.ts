import { env } from "cloudflare:workers";
export type { SqlStatement, StoredObject } from "@/lib/platform-types";
import type { SqlStatement, StoredObject } from "@/lib/platform-types";

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await env.DB.prepare(sql).bind(...params).all<T>();
  return result.results;
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  return await env.DB.prepare(sql).bind(...params).first<T>();
}

export async function execute(sql: string, params: unknown[] = []) {
  await env.DB.prepare(sql).bind(...params).run();
}

export async function batch(statements: SqlStatement[]) {
  await env.DB.batch(statements.map((statement) => env.DB.prepare(statement.sql).bind(...(statement.params ?? []))));
}

export function runtimeValue(name: string): string | undefined {
  const value = (env as unknown as Record<string, unknown>)[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export async function putObject(
  key: string,
  body: Uint8Array,
  metadata: { contentType: string; cacheControl: string },
) {
  await env.BUCKET.put(key, body, {
    httpMetadata: {
      contentType: metadata.contentType,
      cacheControl: metadata.cacheControl,
    },
  });
}

export async function getObject(key: string): Promise<StoredObject | null> {
  const object = await env.BUCKET.get(key);
  if (!object) return null;

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  return {
    body: object.body,
    contentType: headers.get("content-type") ?? undefined,
    cacheControl: headers.get("cache-control") ?? undefined,
    etag: object.httpEtag,
  };
}
