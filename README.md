# Unlisted

Unlisted is a privacy-intelligence project for building a trustworthy, provenance-aware registry of data brokers and their privacy/removal workflows. The first phase is ingestion and verification; removal automation is a separate, later capability.

## Product principles

- Combine government registries, compatible open datasets, and direct broker-site verification; do not trust a single master list.
- Preserve raw source records and history. Normalize into canonical entities without erasing source evidence.
- Track provenance, license, confidence, and verification time at the field or record level.
- Model legal entities, brands, corporate groups, domains, and shared removal providers separately.
- Keep discovery/classification read-only. Never submit requests without an explicit, separately authorized user flow.
- Prefer high-value people-search targets and shared removal systems when prioritizing workflow research.

## Current status

The initial website is a source-planning directory. It does not claim that broker records have been ingested or verified yet. The recommended runtime direction is TypeScript on Cloudflare Workers, with D1 for relational registry data and R2 for permitted raw source snapshots. The GitHub repository is the source of truth; Cloudflare serves the website. See the [runtime decision record](docs/decisions/0001-cloudflare-runtime.md), [roadmap](docs/ROADMAP.md), and [architecture notes](docs/ARCHITECTURE.md).

## Local development

Requires Node.js 22 (pinned in `.nvmrc`).

```sh
npm install
npm run dev
```

Create a production build with `npm run build`. Connect the GitHub repository to Cloudflare Workers Builds to deploy on pushes to `main`; the repository includes the Worker configuration and build scripts for that flow.

## Repository map

- `AGENTS.md` — contributor and parallel-agent boundaries.
- `docs/ROADMAP.md` — supplied project research and proposed backlog.
- `docs/ARCHITECTURE.md` — initial domain model and implementation sequence.
- `docs/decisions/` — architecture decision records as choices are made.
- `src/` — website source.
- `data/` — catalog metadata and, later, reviewed registry records.
- `.github/workflows/` — GitHub automation, including Cloudflare deployment.

## Ingestion foundation

The first D1 schema draft is in `migrations/0001_initial.sql`; source connector types and input validation are in `src/ingestion/`. A connector emits immutable source observations and does not execute privacy requests. Before applying the migration, create the D1 database and add its binding/database ID to `wrangler.jsonc`; keep production IDs and secrets out of Git.
