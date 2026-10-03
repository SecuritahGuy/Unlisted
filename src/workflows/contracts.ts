/** Public, broker-level workflow evidence. Never store a person's request data here. */
export type PrivacyAction =
  | 'delete'
  | 'suppress'
  | 'opt_out_sale_sharing'
  | 'opt_out_targeted_ads'
  | 'limit_sensitive_use'
  | 'access'
  | 'correct'
  | 'unknown';

export type WorkflowChannel = 'web_form' | 'email' | 'phone' | 'mail' | 'state_portal' | 'other';

export type WorkflowSubjectKind = 'broker' | 'brand' | 'removal_provider' | 'state_portal';
export type WorkflowEvidenceSourceKind =
  'government_registry' | 'broker_privacy_notice' | 'broker_request_portal';
export type WorkflowReviewStatus = 'unreviewed' | 'human_verified' | 'stale';

export interface PublicWorkflowEvidenceV1 {
  schemaVersion: 1;
  evidenceId: string;
  subject: {
    kind: WorkflowSubjectKind;
    id: string;
  };
  jurisdiction?: string;
  action: PrivacyAction;
  channel: WorkflowChannel;
  destinationUrl?: string;
  scopeSummary?: string;
  agentSupport: 'yes' | 'no' | 'unclear';
  verificationSummary?: string;
  limitationsSummary?: string;
  evidence: {
    sourceUrl: string;
    sourceKind: WorkflowEvidenceSourceKind;
    observedAt: string;
    contentDigest?: string;
  };
  reviewStatus: WorkflowReviewStatus;
}

const actionValues: PrivacyAction[] = [
  'delete',
  'suppress',
  'opt_out_sale_sharing',
  'opt_out_targeted_ads',
  'limit_sensitive_use',
  'access',
  'correct',
  'unknown',
];
const channelValues: WorkflowChannel[] = [
  'web_form',
  'email',
  'phone',
  'mail',
  'state_portal',
  'other',
];
const subjectKinds: WorkflowSubjectKind[] = ['broker', 'brand', 'removal_provider', 'state_portal'];
const sourceKinds: WorkflowEvidenceSourceKind[] = [
  'government_registry',
  'broker_privacy_notice',
  'broker_request_portal',
];
const reviewStatuses: WorkflowReviewStatus[] = ['unreviewed', 'human_verified', 'stale'];
const sha256Pattern = /^[a-f0-9]{64}$/i;

/** Runtime boundary for curated public evidence; rejects any unmodeled (possibly private) data. */
export function validatePublicWorkflowEvidence(
  value: unknown,
): asserts value is PublicWorkflowEvidenceV1 {
  const root = requireObject(value, 'workflow evidence');
  requireExactKeys(
    root,
    [
      'schemaVersion',
      'evidenceId',
      'subject',
      'jurisdiction',
      'action',
      'channel',
      'destinationUrl',
      'scopeSummary',
      'agentSupport',
      'verificationSummary',
      'limitationsSummary',
      'evidence',
      'reviewStatus',
    ],
    'workflow evidence',
  );

  if (root.schemaVersion !== 1) throw new Error('Unsupported workflow evidence schema version.');
  requireNonEmptyString(root.evidenceId, 'evidenceId');
  requireEnum(root.action, actionValues, 'action');
  requireEnum(root.channel, channelValues, 'channel');
  requireEnum(root.agentSupport, ['yes', 'no', 'unclear'], 'agentSupport');
  requireEnum(root.reviewStatus, reviewStatuses, 'reviewStatus');
  requireOptionalText(root.jurisdiction, 'jurisdiction');
  requireOptionalText(root.scopeSummary, 'scopeSummary');
  requireOptionalText(root.verificationSummary, 'verificationSummary');
  requireOptionalText(root.limitationsSummary, 'limitationsSummary');
  if (root.destinationUrl !== undefined) requireHttpsUrl(root.destinationUrl, 'destinationUrl');

  const subject = requireObject(root.subject, 'subject');
  requireExactKeys(subject, ['kind', 'id'], 'subject');
  requireEnum(subject.kind, subjectKinds, 'subject.kind');
  requireNonEmptyString(subject.id, 'subject.id');

  const evidence = requireObject(root.evidence, 'evidence');
  requireExactKeys(
    evidence,
    ['sourceUrl', 'sourceKind', 'observedAt', 'contentDigest'],
    'evidence',
  );
  requireHttpsUrl(evidence.sourceUrl, 'evidence.sourceUrl');
  requireEnum(evidence.sourceKind, sourceKinds, 'evidence.sourceKind');
  requireNonEmptyString(evidence.observedAt, 'evidence.observedAt');
  if (!Number.isFinite(Date.parse(evidence.observedAt as string))) {
    throw new Error('evidence.observedAt must be a valid date.');
  }
  if (
    evidence.contentDigest !== undefined &&
    (typeof evidence.contentDigest !== 'string' || !sha256Pattern.test(evidence.contentDigest))
  ) {
    throw new Error('evidence.contentDigest must be a SHA-256 hex digest.');
  }
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireExactKeys(value: Record<string, unknown>, allowed: string[], label: string): void {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown) throw new Error(`${label} contains an unsupported field: ${unknown}.`);
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: T[],
  label: string,
): asserts value is T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new Error(`${label} has an unsupported value.`);
  }
}

function requireNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`${label} must be a non-empty string.`);
}

function requireOptionalText(value: unknown, label: string): void {
  if (value !== undefined && typeof value !== 'string') {
    throw new Error(`${label} must be text when provided.`);
  }
}

function requireHttpsUrl(value: unknown, label: string): void {
  if (typeof value !== 'string') throw new Error(`${label} must be a URL.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (url.protocol !== 'https:') throw new Error(`${label} must use HTTPS.`);
}
