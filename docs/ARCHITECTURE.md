# Initial architecture map

This is a domain map and initial runtime recommendation. See [decision 0001](decisions/0001-cloudflare-runtime.md); verify details against actual source formats and update requirements before committing to storage or deployment specifics.

## Implemented foundation

- The public site currently presents the source candidates and project method; it does not publish broker rows.
- `src/ingestion/contracts.ts` defines source manifests, immutable observations, connector boundaries, and normalized broker candidates.
- `src/ingestion/sources/cppa-2025.ts` reads the official 2025 CPPA CSV format as a manually invoked, read-only connector. `npm run ingest:cppa:preview` validates the live file in memory and prints aggregate counts; it is not wired to database persistence.
- `migrations/0001_initial.sql` drafts the first D1 tables for sources, ingestion runs, immutable observations, broker identities, aliases, and registrations.
- The CPPA source remains marked for license review. Do not persist or publish its records until reuse terms are approved and represented in source metadata.
- The live CPPA 2025 snapshot validated 543 rows on 2026-10-03. It is historical, contains some metrics labeled 2023, and has no dataset-specific reuse statement identified yet. Stable source keys and field-level storage/display rules must be decided before persistent ingestion.
- `migrations/0003_reviewed_field_storage.sql` adds append-only field-policy decisions, a minimized observation table without raw payloads, a constrained field-value table, and a verified public view. CPPA policies are seeded pending, and a trigger blocks full-row storage without explicit full-payload approval. The full-row `source_observations` path remains unsuitable for CPPA until that approval is explicit.

## Recommended runtime direction

- **TypeScript + Cloudflare Workers** for hosted APIs and scheduled/queued ingestion. Workers treats TypeScript as a first-class language and exposes typed platform APIs; its runtime is web-standard-oriented with a defined subset of Node.js compatibility, so validate dependencies against Workers rather than assuming a full Node server environment.
- **D1** as the initial relational store for canonical broker data, registrations, source observations, and workflow metadata. It uses SQLite semantics and integrates through Worker bindings. Keep migrations portable and avoid depending on unsupported SQLite features.
- **R2** for permitted raw source artifacts and larger snapshots; keep compact metadata, checksums, and references in D1. Respect each source's license and retention terms before storing raw copies.
- **Queues or Workflows** for refresh jobs that need asynchronous processing, retries, or durable multi-step state. Begin with the simplest scheduled ingestion path and add these only when a source's refresh behavior needs them.
- **Browser-based workflow inspection** should remain a separate research capability. Do not assume a Worker is a full desktop browser environment; choose a compatible controlled-browser runner when that work is implemented.

This is a good fit for the source-connector agent split: each connector can be an independent TypeScript module implementing one shared observation interface, with common validation and storage owned centrally.

## Data flow

```text
Government and compatible open sources
                   ↓
       Immutable source observations
                   ↓
          Normalization + provenance
                   ↓
    Entity resolution with match evidence
                   ↓
      Broker and provider intelligence
                   ↓
 Read-only endpoint/workflow discovery
                   ↓
       Human verification and review
                   ↓
           Adapter implementation
                   ↓
 Explicit user-authorized privacy actions
```

Raw observations must be append-only. Corrections and refreshed source values create new observations; normalized views can be rebuilt without losing history.

## Core concepts

- **Source**: publisher, source type, URI, license, refresh policy, and connector metadata.
- **Source observation**: timestamped raw record or reference to a permitted raw artifact, with a stable source key and checksum where practical.
- **Broker**: canonical organization identity independent of its name; carries a stable internal ID.
- **Alias / brand / domain**: distinct names and web properties associated with a broker or corporate group, with evidence for each association.
- **Government registration**: a broker's registration in a jurisdiction, linked to the source observation rather than flattened away.
- **Privacy endpoint / action**: a verified endpoint and supported action (for example delete, suppress, opt out of sale/share, access, correct, or limit sensitive data).
- **Removal provider / workflow**: a shared portal or process that can serve multiple broker brands, with observed steps and verification requirements.
- **Evidence**: source URL, observation time, capture/reference, reviewer, confidence, and license context supporting a claim.

The roadmap's proposed table list is a useful candidate, not a locked schema. Define the canonical data contract before parallel source connectors are implemented.

## Initial delivery sequence

1. Inspect current source formats, refresh terms, and licenses; write source manifests.
2. Review source reuse terms and confirm the canonical field mapping for CPPA.
3. Create separate Cloudflare D1 databases for development and production; bind the intended database in Wrangler and apply the initial migration.
4. Add a persistence layer that refuses production ingestion unless the source license status permits it.
5. Implement the remaining government registries and the people-search dataset as independent ingestion tasks against the shared observation contract.
6. Add entity-resolution review queues and a read-only API for the website to query verified public records.
7. Research high-priority removal workflows and shared providers; keep crawling read-only.
8. Define security, consent, identity handling, and authorization requirements before implementing request execution.

## Parallel work boundaries

Once contracts are agreed, source connectors can be split by source (for example CPPA, Oregon, Texas, Vermont, and legacy California AG). Each connector should own its module and fixtures, emit the same versioned observation contract, and document refresh/licensing constraints. Entity resolution and shared schema changes should have one integrator to avoid conflicting assumptions.
