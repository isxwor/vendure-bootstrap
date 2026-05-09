# vendure-bootstrap

A pre-configured [Vendure](https://www.vendure.io) commerce server, originally generated with [`@vendure/create`](https://github.com/vendure-ecommerce/vendure/tree/master/packages/create) and extended with:

- **Bun** as the package manager and script runner
- **PostgreSQL** as the database
- **S3-compatible** asset storage (with a local-disk fallback)
- **SMTP** email transport (with a dev mailbox fallback)
- **Vendure Dashboard** (React/Vite) served from the Vendure server
- **GraphQL Codegen** for typed Admin/Shop API clients
- **Husky + commitlint + lint-staged + Prettier** for commit hygiene
- A multi-stage **Docker** image based on `oven/bun:1-alpine`
- A custom **Branding plugin** (`src/plugins/branding`)

Useful Vendure links:

- [Vendure docs](https://www.vendure.io/docs)
- [Vendure Discord community](https://www.vendure.io/community)
- [Vendure on GitHub](https://github.com/vendure-ecommerce/vendure)
- [Vendure plugin template](https://github.com/vendure-ecommerce/plugin-template)

## Directory structure

- `/src` — Vendure server source. Custom plugins live in `src/plugins/`.
- `/src/migrations` — TypeORM migrations (committed).
- `/src/codegen` — Generated Admin/Shop API TypeScript types (do not edit).
- `/scripts` — One-off scripts (e.g. `seed.ts` for populating initial data).
- `/static` — Non-code assets: uploaded files (`static/assets`) and email templates (`static/email/templates`).
- `src/vendure-config.ts` — Server configuration (DB, plugins, auth, email, assets).
- `vite.config.mts` — Build config for the Vendure Dashboard bundle.
- `Dockerfile` / `docker-compose.yml` / `entrypoint.sh` / `build.sh` — Containerization & build pipeline.

## Prerequisites

- **Node.js** `^18.17.0 || ^20.3.0 || >=21.0.0` (required by the `sharp` image library)
- **Bun** `>=1.0` — used for installs and scripts (`bun install`, `bun run …`)
- **Docker** — only needed if you use `docker-compose` for local services

## Initial setup

```bash
# 1. Install dependencies
bun install

# 2. Copy environment variables and edit as needed
cp .env.example .env

# 3. Start a Postgres instance (any way you like; here via docker compose)
docker compose up -d postgres_db

# 4. Run migrations
bun run migration:run

# 5. (Optional) Seed initial data, products and assets
bun run seed
```

> The provided `docker-compose.yml` exposes Postgres on host port **6543** (not 5432) to avoid colliding with a locally running Postgres. Update `DB_PORT` in `.env` accordingly if you use it.

### Environment variables

See [`.env.example`](./.env.example) for the full list. Key flags:

| Variable    | Purpose                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `APP_ENV`   | `dev` enables GraphQL debug endpoints and disables `trustProxy`.                                       |
| `EMAIL_ENV` | `dev` writes emails to `static/email/test-emails` and serves a `/mailbox` route instead of using SMTP. |
| `ASSET_ENV` | `local` stores uploaded assets on disk under `static/assets`; otherwise S3 credentials are used.       |
| `DB_*`      | PostgreSQL connection settings.                                                                        |
| `S3_*`      | S3-compatible storage settings (used when `ASSET_ENV != local`).                                       |
| `SMTP_*`    | SMTP transport (used when `EMAIL_ENV != dev`).                                                         |

## Development

```bash
bun run dev
```

This starts both the Vendure **server** and **worker** in watch mode (via `concurrently` + `ts-node-dev`).

Default endpoints:

- Shop API: `http://localhost:3000/shop-api`
- Admin API: `http://localhost:3000/admin-api`
- Admin Dashboard: `http://localhost:3000/dashboard`
- GraphiQL: `http://localhost:3000/graphiql`
- Dev mailbox (when `EMAIL_ENV=dev`): `http://localhost:3000/mailbox`

## Build

```bash
bun run build
```

The [`build.sh`](./build.sh) script:

1. Cleans `dist/`
2. Compiles TypeScript (`tsc`)
3. Builds the Vendure Dashboard bundle (`vite build`)
4. Copies email templates into `dist/static/email/`

## Production

### Run directly

```bash
bun run start
```

This invokes [`entrypoint.sh`](./entrypoint.sh), which sources `.env` and runs the worker and server in parallel, propagating `SIGINT`/`SIGTERM` so both shut down cleanly.

You can also run them individually:

```bash
bun run start:server
bun run start:worker
```

For multi-process management, [pm2](https://pm2.keymetrics.io/) works well.

### Docker

A multi-stage [`Dockerfile`](./Dockerfile) based on `oven/bun:1-alpine` builds the app and ships only the runtime artifacts (`dist`, `static`, `migration.ts`, `entrypoint.sh`, lockfiles).

```bash
# Build
docker build -t vendure-bootstrap .

# Run (server + worker via entrypoint.sh)
docker run --rm -p 3000:3000 --env-file .env vendure-bootstrap
```

The image's `ENTRYPOINT` is `./entrypoint.sh`, so the container runs both the server and worker in one process tree. Run two containers (each with its own command) if you prefer to scale them independently.

### Docker Compose

[`docker-compose.yml`](./docker-compose.yml) provides commonly-used backing services (PostgreSQL, MySQL, MariaDB, Redis, Typesense, Elasticsearch). Default ports are remapped to avoid host-port conflicts — see the file for specifics.

```bash
docker compose up -d postgres_db
docker compose up -d redis
docker compose up -d typesense
```

## Plugins

Custom functionality lives in [plugins](https://www.vendure.io/docs/plugins/) under `src/plugins/`. This project ships a small `BrandingPlugin` as an example and as the dashboard branding hook.

To scaffold a new plugin:

```bash
bunx vendure add
```

…and select **`[Plugin] Create a new Vendure plugin`**.

## Migrations

[Migrations](https://www.vendure.io/docs/developer-guide/migrations/) keep the database schema in sync with your entities and `customFields`. `synchronize` is **off** in this project — every schema change must be captured in a migration.

```bash
# Generate a new migration after editing entities / customFields
bun run migration:generate <name>

# Apply pending migrations
bun run migration:run

# Revert the most recent migration
bun run migration:revert
```

Generated files land in `src/migrations/` and **must be committed**. They are also executed automatically on server start by `runMigrations()` in [`src/index.ts`](./src/index.ts).

## GraphQL Codegen

Typed clients for the Admin and Shop APIs are generated from a running server:

```bash
# Server must be running on localhost:3000
bun run codegen
```

Output:

- `src/codegen/shopTypes.ts`
- `src/codegen/adminTypes.ts`

Configuration: [`codegen.ts`](./codegen.ts).

## Seeding

```bash
bun run seed
```

Populates the database using `scripts/data/initial-data.ts` and `scripts/data/products.csv`, imports assets from `scripts/data/assets/`, and sets the default channel currency to `NPR` (with `USD` available). Edit [`scripts/seed.ts`](./scripts/seed.ts) to customize.

## Code style & commits

- **Prettier** runs on staged files via `lint-staged` on every commit (`bun format`).
- **Husky** installs Git hooks (`bun run prepare`, executed automatically after `bun install`).
- **commitlint** enforces [Conventional Commits](https://www.conventionalcommits.org/) — see [`commitlint.config.js`](./commitlint.config.js).

## Troubleshooting

### `Could not load the "sharp" module …`

- Ensure your Node version is `^18.17.0 || ^20.3.0 || >=21.0.0`.
- Update your package manager.
- As a last resort, install `sharp` for your specific platform:

    ```bash
    bun add sharp --os linux --cpu x64
    # or
    npm install sharp --os linux --cpu x64
    ```

### Migrations fail on first start

The `entrypoint.sh` migration step is currently commented out. Run `bun run migration:run` manually after the database is reachable, or uncomment that block in `entrypoint.sh` to run it on every container start.

### Port conflicts with `docker compose`

The compose file intentionally remaps default ports (e.g. Postgres → `6543`, Redis → `6479`, Typesense → `8208`). Either keep your `.env` aligned with those host ports, or change the `ports:` mappings in `docker-compose.yml`.
