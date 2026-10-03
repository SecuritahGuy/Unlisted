import type { RawSourceObservation, SourceManifest } from './contracts';

const sourceIdPattern = /^[a-z0-9][a-z0-9-]{1,62}$/;
const sha256Pattern = /^[a-f0-9]{64}$/i;

export function validateSourceManifest(value: SourceManifest): void {
  if (!sourceIdPattern.test(value.id)) {
    throw new Error(`Invalid source id: ${value.id}`);
  }
  if (!value.name.trim() || !value.publisher.trim()) {
    throw new Error('Source name and publisher are required.');
  }
  assertHttpsUrl(value.sourceUrl, 'source URL');
  if (value.licenseUrl) assertHttpsUrl(value.licenseUrl, 'license URL');
  if (value.licenseStatus === 'approved' && !value.licenseName) {
    throw new Error('Approved sources must name the reviewed license.');
  }
}

export function validateObservation(value: RawSourceObservation): void {
  if (!sourceIdPattern.test(value.sourceId)) {
    throw new Error(`Invalid source id: ${value.sourceId}`);
  }
  if (!value.sourceRecordKey.trim()) {
    throw new Error('Source record key is required.');
  }
  if (!Number.isFinite(Date.parse(value.observedAt))) {
    throw new Error('Observation time must be a valid ISO-compatible date.');
  }
  if (!sha256Pattern.test(value.recordHash)) {
    throw new Error('Record hash must be a 64-character SHA-256 hex string.');
  }
  if (!value.ingestionRunId.trim()) {
    throw new Error('Ingestion run id is required.');
  }
  if (value.sourceRecordUrl) assertHttpsUrl(value.sourceRecordUrl, 'source record URL');
  if (value.rawSnapshotKey && value.rawSnapshotKey.startsWith('/')) {
    throw new Error('R2 snapshot keys must be relative object keys.');
  }
  try {
    JSON.stringify(value.rawRecord);
  } catch {
    throw new Error('Raw source record must be JSON serializable.');
  }
}

function assertHttpsUrl(value: string, label: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  if (url.protocol !== 'https:') {
    throw new Error(`${label} must use HTTPS.`);
  }
}

/** Call from the persistence boundary; collection alone does not authorize reuse. */
export function assertProductionPersistenceAllowed(source: SourceManifest): void {
  validateSourceManifest(source);
  if (source.licenseStatus !== 'approved') {
    throw new Error(
      `Source ${source.id} is not approved for production persistence (status: ${source.licenseStatus}).`,
    );
  }
}
