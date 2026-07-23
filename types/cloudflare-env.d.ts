declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET: R2Bucket;
    INGEST_TOKEN: string;
    AFFILIATE_LINKS_JSON?: string;
    AFFILIATE_REPORT_TOKEN?: string;
  }
}
