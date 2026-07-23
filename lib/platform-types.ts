export type SqlStatement = {
  sql: string;
  params?: unknown[];
};

export type StoredObject = {
  body: BodyInit;
  contentType?: string;
  cacheControl?: string;
  etag?: string;
};
