import type { SourceManifest } from './contracts.ts';
import { assertProductionPersistenceAllowed } from './validation.ts';

export type PolicyStatus = 'pending' | 'approved' | 'denied';
export type ApprovedFieldKey = 'broker_name' | 'dba' | 'website_url' | 'privacy_rights_url';

export interface SourceFieldDecision {
  sourceId: string;
  fieldKey: ApprovedFieldKey;
  sourceFieldLabel: string;
  storageStatus: PolicyStatus;
  displayStatus: PolicyStatus;
}

export interface ProjectedField {
  fieldKey: ApprovedFieldKey;
  value: string;
  sourceFieldLabel: string;
}

/** Proposed CPPA projection. Every field stays blocked pending a source review. */
export const cppa2025ProposedFields: SourceFieldDecision[] = [
  {
    sourceId: 'cppa-2025',
    fieldKey: 'broker_name',
    sourceFieldLabel: 'Data broker name',
    storageStatus: 'pending',
    displayStatus: 'pending',
  },
  {
    sourceId: 'cppa-2025',
    fieldKey: 'dba',
    sourceFieldLabel: 'Doing Business As (DBA), if applicable',
    storageStatus: 'pending',
    displayStatus: 'pending',
  },
  {
    sourceId: 'cppa-2025',
    fieldKey: 'website_url',
    sourceFieldLabel: 'Data broker primary website',
    storageStatus: 'pending',
    displayStatus: 'pending',
  },
  {
    sourceId: 'cppa-2025',
    fieldKey: 'privacy_rights_url',
    sourceFieldLabel: 'Primary site explaining how consumers exercise CA CCPA rights/delete PI',
    storageStatus: 'pending',
    displayStatus: 'pending',
  },
];

/**
 * Builds a field-minimized value set. It never copies the raw record wholesale
 * and requires source plus field-level storage approval before returning data.
 */
export function projectApprovedFields(
  source: SourceManifest,
  rawRecord: Record<string, unknown>,
  decisions: SourceFieldDecision[],
): ProjectedField[] {
  assertProductionPersistenceAllowed(source);

  const fields: ProjectedField[] = [];
  const seen = new Set<ApprovedFieldKey>();
  for (const decision of decisions) {
    if (decision.sourceId !== source.id || decision.storageStatus !== 'approved') continue;
    if (seen.has(decision.fieldKey)) {
      throw new Error(`Duplicate field policy for ${source.id}.${decision.fieldKey}.`);
    }
    seen.add(decision.fieldKey);

    const rawValue = rawRecord[decision.sourceFieldLabel];
    if (rawValue === undefined || rawValue === null) continue;
    if (typeof rawValue !== 'string') {
      throw new Error(`Expected a text value for ${decision.sourceFieldLabel}.`);
    }
    const value = rawValue.trim();
    // In particular, honor CPPA's instruction not to surface a blank DBA.
    if (!value) continue;
    fields.push({
      fieldKey: decision.fieldKey,
      value,
      sourceFieldLabel: decision.sourceFieldLabel,
    });
  }

  if (fields.length === 0) {
    throw new Error(`Source ${source.id} has no nonblank fields approved for storage.`);
  }
  return fields;
}

/** Public projection requires both the latest field decision and verified broker status. */
export function assertFieldDisplayAllowed(
  source: SourceManifest,
  decision: SourceFieldDecision | undefined,
  brokerReviewStatus: 'unreviewed' | 'in-review' | 'verified' | 'rejected',
): void {
  assertProductionPersistenceAllowed(source);
  if (brokerReviewStatus !== 'verified') {
    throw new Error(`Broker must be verified before fields from ${source.id} can be displayed.`);
  }
  if (
    !decision ||
    decision.sourceId !== source.id ||
    decision.storageStatus !== 'approved' ||
    decision.displayStatus !== 'approved'
  ) {
    throw new Error(`Field is not approved for public display from ${source.id}.`);
  }
}
