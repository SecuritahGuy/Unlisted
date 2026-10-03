export type LicenseReviewStatus =
  'unknown' | 'review-required' | 'approved' | 'restricted' | 'prohibited';

export type SourceKind =
  'government-registry' | 'government-archive' | 'open-dataset' | 'research-reference';

export interface SourceManifest {
  id: string;
  name: string;
  publisher: string;
  kind: SourceKind;
  jurisdiction: string | null;
  sourceUrl: string;
  licenseStatus: LicenseReviewStatus;
  licenseName?: string;
  licenseUrl?: string;
  refreshPolicy: 'manual' | 'scheduled' | 'unknown';
  notes?: string;
}

/** One immutable source record as observed during a specific ingestion run. */
export interface RawSourceObservation {
  sourceId: string;
  sourceRecordKey: string;
  observedAt: string;
  recordHash: string;
  rawRecord: Record<string, unknown>;
  sourceRecordUrl?: string;
  rawSnapshotKey?: string;
  ingestionRunId: string;
}

export interface IngestionContext {
  runId: string;
  observedAt: string;
  signal?: AbortSignal;
}

/** Connectors emit observations only. They must not submit privacy requests. */
export interface SourceConnector {
  readonly manifest: SourceManifest;
  collect(context: IngestionContext): AsyncIterable<RawSourceObservation>;
}

export interface BrokerCandidate {
  sourceObservationId: string;
  registeredName: string;
  jurisdiction: string;
  registrationStatus?: string;
  registrationYear?: number;
  websiteUrl?: string;
  declaredPrivacyUrl?: string;
}

export type NormalizationOutcome =
  | { status: 'accepted'; candidate: BrokerCandidate }
  | { status: 'needs-review'; reason: string; candidate?: BrokerCandidate }
  | { status: 'rejected'; reason: string };
