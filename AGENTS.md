# Unlisted — agent and contributor guide

## Project goal
Build a privacy intelligence service that discovers data brokers, preserves source evidence and provenance, maps corporate groups and removal providers, and helps users track privacy actions they authorize. Discovery and workflow analysis must never submit a person's information or a privacy request.

## Working agreements
- Read `README.md`, `docs/ROADMAP.md`, and `docs/ARCHITECTURE.md` before making structural changes.
- Treat `docs/ROADMAP.md` as the product research brief. It contains hypotheses and time-sensitive figures; verify them before turning them into current facts or production classifications.
- Keep source records immutable. Store normalized interpretations separately and retain source, license, observation time, and evidence for derived facts.
- Treat `src/ingestion/contracts.ts` as the shared ingestion interface. Coordinate changes to it and `migrations/` through one integrator before parallel connector work begins.
- Never submit an opt-out, deletion, access, or other privacy request as part of crawling, discovery, tests, or fixtures. Submission requires a separate, explicit user-authorized flow.
- Do not copy noncommercial-licensed datasets into production or redistribute their derived records without resolving the license. Track licensing at source and record level.
- Prefer small, explicit interfaces between components. The current recommended direction is TypeScript on Cloudflare Workers; see `docs/decisions/0001-cloudflare-runtime.md`. Add an ADR under `docs/decisions/` for material choices such as database schema, entity resolution, or deployment.
- Keep tests and fixtures local and deterministic. Do not hit broker or government sites in ordinary tests.

## Parallel-agent workflow
Break work into bounded tasks with a named owner, file/directory scope, expected artifacts, and acceptance criteria. Assign independent source adapters or isolated docs/schema tasks in parallel; keep shared contracts (canonical IDs, normalized schema, provenance model, workflow/action taxonomy) owned by one integrator until agreed.

Before parallel implementation:
1. Agree on the interface or schema the tasks will use.
2. Give each agent disjoint files/directories where practical.
3. Ask agents not to edit shared contracts unless that is their assigned task.
4. Integrate and review changes together; resolve conflicts centrally.

A useful task handoff includes: objective, in-scope paths, out-of-scope paths, inputs/contracts, deliverables, acceptance criteria, and known risks. Agents should report changed files, assumptions, and verification performed. Do not claim a source is current or an adapter works without evidence.

## Suggested work areas
- `src/ingestion/sources/`: one government or open-data source connector per module.
- `src/ingestion/`: source observation contracts, parsing, validation, and field-level provenance.
- `migrations/`: ordered D1 schema migrations; shared and centrally reviewed.
- `src/entity_resolution/`: aliases, domains, corporate groups, and match evidence.
- `src/discovery/`: broker-site endpoint discovery and classification; read-only.
- `src/workflows/`: workflow models and automation classes; no request execution.
- `src/adapters/`: separately reviewed, explicitly authorized user-request execution, only after product/security requirements are defined.
- `data/`: source manifests and small synthetic fixtures only; never commit personal data or unlicensed bulk datasets.
- `docs/`: roadmap, architecture, decisions, and research notes.

These boundaries are intended for TypeScript modules and Cloudflare Workers, subject to the runtime decision record. Establish shared contracts before creating implementation directories.
