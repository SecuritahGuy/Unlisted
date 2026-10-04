# Decision 0002: Private request tracking boundary

- Status: Required design gate before private request tracking or request submission
- Date: 2026-10-04

## Context

The public directory stores broker-level workflow evidence. A future personal tracker could hold contact details, identity-matching material, authorization, request status, and response history. Those records have different access and deletion needs from public broker facts. The existing public API and workflow evidence contract must not become a path for exposing personal request data.

## Decision

Keep the public broker catalog and any future person-specific request workspace in separate data models and access paths. This ADR defines minimum engineering requirements before adding request forms, request tables, or submission adapters. It does not approve a particular legal basis, retention period, identity document collection, or automated submission process.

## Required controls before implementation

1. **Minimize collection.** Collect only the fields needed for the specific action. Prefer a provider-hosted verification step; do not copy government IDs or verification answers into Unlisted unless a separately reviewed design establishes necessity and safeguards.
2. **Separate identity from workflow state.** Store contact/identity material apart from broker-level evidence and public APIs. Link private request status through opaque internal identifiers. Do not place personal details in public workflow records, URLs, analytics, telemetry, or error messages.
3. **Scope authorization.** Record the person who authorized the action, the broker, action, destination, and scope. Authorization must be explicit, understandable, revocable before submission, and checked at the point of submission. No discovery, scheduled job, retry, or adapter may submit without a current authorization for that exact action.
4. **Control access and secrets.** Require authenticated access; enforce account-level authorization server-side; protect credentials and encryption keys using platform secret facilities; exclude request bodies, identifiers, and tokens from logs; and restrict staff access with auditable least privilege.
5. **Define lifecycle.** Before release, specify retention for identity material, request status, evidence, and audit events separately. Provide a user-initiated deletion path and document any records that must remain, with a reason and expiry.
6. **Make state changes auditable.** Define allowed request states and transitions, including cancellation, provider confirmation, denial, and follow-up. Keep a minimal audit trail without duplicating sensitive payloads.
7. **Verify boundaries.** Add deterministic tests proving public endpoints cannot return private fields, logs redact sensitive values, cross-account access is denied, deletion follows policy, and no request is submitted without explicit matching authorization.

## Consequences

- `required_identifiers`, `removal_requests`, `removal_events`, and `monitoring_jobs` remain roadmap concepts, not an approved schema.
- No D1 migration or user-facing personal request form should be added until a detailed implementation design resolves authentication, authorization, data lifecycle, and operational controls against these requirements.
- Public workflow evidence remains limited to business-level instructions and provenance.

## Related material

- [Agent and contributor guide](../../AGENTS.md)
- [Architecture and delivery sequence](../ARCHITECTURE.md)
- [Public workflow evidence contract](../../src/workflows/contracts.ts)
