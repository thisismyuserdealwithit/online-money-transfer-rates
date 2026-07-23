# Online Money Transfer Rates

Source for [onlinemoneytransfer.co.uk](https://onlinemoneytransfer.co.uk), a proof-led comparison site for international money transfers. It publishes corridor-specific quotes, keeps the screenshot behind each result and retains older captures for historical analysis.

The application now supports two deployment targets from the same source:

- Render: standard Next.js, Render Postgres and either Postgres-backed proof storage or an S3-compatible object store.
- OpenAI Sites: Vinext, Cloudflare D1 and R2.

The scheduled Playwright crawler remains in GitHub Actions. It visits public provider quote tools and sends structured quote records and screenshots to the chosen deployment.

## Deploy on Render

The repository includes a Render Blueprint in `render.yaml`. In Render:

1. Choose **New**, then **Blueprint**.
2. Connect this GitHub repository.
3. Enter strong values for `INGEST_TOKEN`, `MANUAL_INGEST_TOKEN` and `AFFILIATE_REPORT_TOKEN` when Render prompts for them.
4. Apply the Blueprint.

The Blueprint creates:

- a Frankfurt Node web service on the Starter plan;
- a Frankfurt Render Postgres database on the Basic 256 MB plan;
- an automatic pre-deploy schema migration;
- a `/api/health` database health check;
- automatic deployments from commits to the connected branch.

The build and start commands are:

```sh
npm ci
npm run render:build
npm run db:migrate:render
npm run render:start
```

`DATABASE_URL` is supplied automatically by the Blueprint.

### Proof screenshot storage

The first Render deployment works without another service. In that mode screenshots are kept in the `proof_objects` Postgres table. This is useful for initial verification, but a growing screenshot archive will increase database storage.

For production volume, configure an S3-compatible bucket on the Render web service:

```text
S3_BUCKET
S3_REGION
S3_ENDPOINT
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_FORCE_PATH_STYLE
```

`S3_ENDPOINT` and `S3_FORCE_PATH_STYLE` are optional for AWS S3. They allow the same code to use services such as Cloudflare R2. New proof images use object storage as soon as `S3_BUCKET` is present. Existing Postgres-backed images should be migrated before switching if their old proof links need to remain available.

### Connect the daily crawler

Once Render gives the web service its public URL, add these GitHub Actions repository secrets:

```text
INGEST_ENDPOINT=https://your-render-domain.example/api/ingest
INGEST_TOKEN=the-same-value-entered-in-render
```

`SITES_BYPASS_TOKEN` is only needed when the crawler posts to an owner-protected Sites deployment. It is not needed for Render.

The workflow in `.github/workflows/daily-rates.yml` runs at 05:17 UTC every day and can also be started manually.

### Existing Sites history

Deploying the Render Blueprint creates a clean database. It does not silently copy the existing D1 and R2 archive. Keep the current Sites deployment active until its historical quote rows and proof objects have been exported and imported. New crawler captures can be directed to Render immediately after its ingest endpoint is verified.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Render Postgres connection string |
| `INGEST_TOKEN` | Bearer token used by the scheduled crawler |
| `MANUAL_INGEST_TOKEN` | Separate bearer token for controlled manual imports |
| `AFFILIATE_REPORT_TOKEN` | Protects the affiliate click report endpoint |
| `AFFILIATE_LINKS_JSON` | Optional JSON map of provider slugs to tracked URLs |
| `PGSSL=require` | Optional for external PostgreSQL connections that require TLS |
| `PG_POOL_MAX` | Optional Postgres connection pool limit, default 10 |
| `S3_*` | Optional S3-compatible proof storage settings described above |

Never commit real token values or local `.env` files.

## Data model

The Postgres migration in `render/postgres-schema.sql` creates:

- `corridors`
- `providers`
- `crawl_runs`
- `quotes`
- `affiliate_clicks`
- `proof_objects`, used only when external object storage is not configured

Captured timestamps remain ISO 8601 text so the same reporting queries work against both D1 and Postgres. Quote and proof records are append-only in normal operation. A newer quote marks the previous current result stale or invalid without deleting the historical row.

## Local verification

Requirements:

- Node.js 22.13 or later
- a PostgreSQL database for a full local Render runtime

Useful checks:

```sh
npm run lint
npm run test:render-schema
npm run render:build
npm test
```

`npm run test:render-schema` loads the complete migration into an in-memory PostgreSQL-compatible test database and verifies quote, proof and affiliate records. `npm test` builds and checks the existing Sites target.

For a local Render-style server, set `DATABASE_URL`, run the migration, build and start:

```sh
export DATABASE_URL=postgresql://...
npm run db:migrate:render
npm run render:build
npm run render:start
```

## Publishing rules

1. A verified result needs a source amount, recipient amount, fee and timestamped provider proof.
2. Indicative converter results stay outside the cheapest verified calculation.
3. Failed captures never overwrite the most recent successful result.
4. Screenshots are immutable. Corrections create a new record.
5. Promotions, card funding, cash pickup, wallets and business quotes are labelled as different comparison cases.
6. A provider name is not treated as a quote until a reproducible result has been captured.

See [CRAWLER.md](CRAWLER.md) for provider-specific capture rules and operational notes.
