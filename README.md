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

The website includes a source-planning directory and ten manually reviewed request-path examples for Epsilon, LexisNexis Risk Solutions, Melissa Data Corporation, Common Room, and FullEnrich. These are first-party workflow examples, not a complete registry or state-registration claims. It does not store user profiles or submit privacy requests. The recommended runtime direction is TypeScript on Cloudflare Workers, with D1 for approved relational registry data and R2 for permitted raw source snapshots. The GitHub repository is the source of truth; Cloudflare serves the website. See the [runtime decision record](docs/decisions/0001-cloudflare-runtime.md), [roadmap](docs/ROADMAP.md), [architecture notes](docs/ARCHITECTURE.md), and [registry-source priority review](docs/research/registry-source-priority.md).

## Local development

Requires Node.js 22 (pinned in `.nvmrc`).

```sh
npm install
npm run dev
```

Create a production build with `npm run build`. The GitHub Actions workflow checks formatting, ingestion/workflow/schema checks, and the website build on pull requests and pushes to `main`. Cloudflare Workers Builds is configured separately in the Cloudflare dashboard for deployment; it is not configured by the GitHub Actions workflow.

## Repository map

- `AGENTS.md` — contributor and parallel-agent boundaries.
- `docs/ROADMAP.md` — supplied project research and proposed backlog.
- `docs/ARCHITECTURE.md` — initial domain model and implementation sequence.
- `docs/decisions/` — architecture decision records as choices are made.
- `src/` — website source.
- `data/` — catalog metadata and, later, reviewed registry records.
- `.github/workflows/` — GitHub Actions checks; Cloudflare deployment is configured in the Cloudflare dashboard.

## Ingestion foundation

The first D1 schema draft is in `migrations/0001_initial.sql`; source connector types and input validation are in `src/ingestion/`. A connector emits immutable source observations and does not execute privacy requests. Before applying the migration, create the D1 database and add its binding/database ID to `wrangler.jsonc`; keep production IDs and secrets out of Git.

The CPPA 2025 connector can be previewed with `npm run ingest:cppa:preview`. It downloads and validates the CSV, then prints aggregate run metadata without retaining broker values or writing to D1. The source remains `review-required`; persistence must wait for documented reuse approval and an approved field mapping. Current state-registry research found CPPA is the strongest technical bulk-ingestion candidate, while Oregon, Texas, and Vermont need human-assisted lookup or access clarification. See the [source priority review](docs/research/registry-source-priority.md). Run deterministic checks with `npm run test:ingestion`.

Public request-path evidence is separately modeled and validated under `src/workflows/`. The sample records are linked from the website, have no user-submitted data, and do not imply that the broker's full practices or every request route were verified. Run their checks with `npm run test:workflows`.

Migration `0003_reviewed_field_storage.sql` adds an append-only policy ledger and a minimized observation path with no raw-row payload. CPPA's proposed fields are seeded as pending, and full-row writes are blocked unless a separate full-payload policy is approved. The migration does not approve reuse or ingest registry records; a public database view also requires approved source and field policies plus a verified broker. Run `npm run test:d1-schema` to validate the local migration and its fail-closed database triggers.
