import { parseCsv } from '../csv.ts';
import type {
  IngestionContext,
  RawSourceObservation,
  SourceConnector,
  SourceManifest,
} from '../contracts.ts';
import { validateObservation, validateSourceManifest } from '../validation.ts';

export const cppa2025Manifest: SourceManifest = {
  id: 'cppa-2025',
  name: 'California Data Broker Registry (2025 snapshot)',
  publisher: 'California Privacy Protection Agency',
  kind: 'government-registry',
  jurisdiction: 'California',
  sourceUrl: 'https://cppa.ca.gov/data_broker_registry/registry2025.csv',
  licenseStatus: 'review-required',
  refreshPolicy: 'manual',
  notes:
    'Official historical snapshot. Review source terms and allowed reuse before persisting or publishing records. Its CSV includes field-level instructions not to surface some unanswered fields; see docs/research/cppa-2025.md.',
};

const maximumDownloadBytes = 10 * 1024 * 1024;

const normalizeHeader = (header: string): string =>
  header
    .replace(/^\uFEFF/, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/:$/, '');

const normalizeName = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'unnamed';

function headerIndex(headers: string[], prefix: string): number {
  return headers.findIndex((header) => header.toLowerCase().startsWith(prefix));
}

function uniqueHeaders(row: string[]): string[] {
  const seen = new Map<string, number>();
  return row.map((raw, index) => {
    const base = normalizeHeader(raw) || `column-${index + 1}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} #${count}`;
  });
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class Cppa2025Connector implements SourceConnector {
  readonly manifest = cppa2025Manifest;
  private readonly request: typeof fetch;

  constructor(request: typeof fetch = fetch) {
    this.request = request;
  }

  async *collect(context: IngestionContext): AsyncIterable<RawSourceObservation> {
    validateSourceManifest(this.manifest);

    const response = await this.request(this.manifest.sourceUrl, {
      headers: { accept: 'text/csv' },
      signal: context.signal,
    });
    if (!response.ok) {
      throw new Error(`CPPA registry download failed with HTTP ${response.status}.`);
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (contentType && !contentType.includes('csv') && !contentType.includes('text/plain')) {
      throw new Error(`CPPA download returned unexpected content type: ${contentType}.`);
    }
    const declaredLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > maximumDownloadBytes) {
      throw new Error('CPPA registry download exceeded the 10 MiB safety limit.');
    }

    const csv = await response.text();
    if (!csv.trim()) throw new Error('CPPA registry download was empty.');
    if (new TextEncoder().encode(csv).byteLength > maximumDownloadBytes) {
      throw new Error('CPPA registry download exceeded the 10 MiB safety limit.');
    }
    const rows = parseCsv(csv);
    const headerRowIndex = rows.findIndex((row) =>
      row.some((cell) => normalizeHeader(cell).toLowerCase() === 'data broker name'),
    );
    if (headerRowIndex < 0) {
      throw new Error('CPPA CSV did not contain the expected “Data broker name” header.');
    }

    const headers = uniqueHeaders(rows[headerRowIndex]);
    if (headers.length < 2) throw new Error('CPPA CSV header row is incomplete.');
    const nameIndex = headerIndex(headers, 'data broker name');
    const websiteIndex = headerIndex(headers, 'data broker primary website');
    if (nameIndex < 0) throw new Error('CPPA CSV is missing the broker name column.');

    const duplicateKeys = new Map<string, number>();
    let emitted = 0;
    for (const [offset, cells] of rows.slice(headerRowIndex + 1).entries()) {
      if (cells.length !== headers.length) {
        throw new Error(
          `CPPA CSV row ${headerRowIndex + offset + 2} has ${cells.length} cells; expected ${headers.length}.`,
        );
      }

      const rawRecord = Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
      const name = cells[nameIndex].trim();
      if (!name) continue;

      const website = websiteIndex >= 0 ? cells[websiteIndex].trim() : '';
      const host = website ? safeHostname(website) : '';
      const baseKey = `${normalizeName(name)}${host ? `--${normalizeName(host)}` : ''}`;
      const ordinal = (duplicateKeys.get(baseKey) ?? 0) + 1;
      duplicateKeys.set(baseKey, ordinal);
      const sourceRecordKey = `csv:${baseKey}:${ordinal}`;
      const recordHash = await sha256(JSON.stringify(rawRecord));
      const observation: RawSourceObservation = {
        sourceId: this.manifest.id,
        sourceRecordKey,
        observedAt: context.observedAt,
        recordHash,
        rawRecord,
        ingestionRunId: context.runId,
      };
      validateObservation(observation);
      emitted += 1;
      yield observation;
    }
    if (emitted === 0) throw new Error('CPPA CSV contained no broker records.');
  }
}

function safeHostname(value: string): string {
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname;
  } catch {
    return '';
  }
}
