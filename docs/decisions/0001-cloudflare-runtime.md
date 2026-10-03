# Decision 0001: Cloudflare runtime direction

- Status: Recommended; validate during the first implementation spike
- Date: 2026-10-03

## Context

Unlisted will be hosted on Cloudflare. The initial product work is source ingestion, normalization, provenance, and read-only workflow discovery. The project also needs clear module boundaries so independent source connectors can be developed in parallel.

## Recommendation

Use TypeScript as the primary language for hosted services and ingestion modules running on Cloudflare Workers. Start with D1 for relational registry data and R2 for permitted larger source snapshots. Use Queues or Workflows when refresh jobs require buffering, retries, or durable multi-step execution.

## Why

- Cloudflare documents TypeScript as a first-class Workers language with platform API types generated from Worker configuration.
- Workers provide a JavaScript standards-oriented runtime, but only a defined subset of Node.js APIs. TypeScript packages and dependencies should be checked for runtime compatibility.
- D1 provides SQL with SQLite semantics and direct Worker bindings, which fits relational entities, registrations, observations, and provenance metadata.
- R2 is object storage suitable for larger raw artifacts, while keeping source snapshots separate from queryable normalized records.
- Cloudflare Queues and Workflows can support asynchronous refresh processing as operational needs emerge.
- One language across API, connector modules, and shared validation keeps interfaces easy to hand off to parallel agents.

## Consequences and limits

- Do not treat Workers as an unrestricted Node.js server; avoid dependencies that require unsupported native modules, long-lived processes, or a local filesystem.
- Keep the source-observation contract and SQL migrations centrally owned. Source connectors should be independent modules with connector-specific fixtures.
- Preserve portability in normalization and entity-resolution logic where practical, so research or batch jobs can run outside Workers if needed.
- Browser-based workflow inspection may need a separate runner; evaluate it independently instead of forcing it into the Worker runtime.
- Before production, validate D1 scale/query needs, R2 storage permissions and license constraints, scheduled refresh behavior, and local development/deployment workflows.
- This decision does not select a frontend framework, ORM, or browser automation provider.

## References

- [Cloudflare Workers TypeScript](https://developers.cloudflare.com/workers/languages/typescript/)
- [Workers runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [D1 getting started](https://developers.cloudflare.com/d1/get-started/)
- [R2 overview](https://developers.cloudflare.com/r2/)
- [Queues overview](https://developers.cloudflare.com/queues/)
- [Workflows overview](https://developers.cloudflare.com/workflows/)
