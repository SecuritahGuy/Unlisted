#!/usr/bin/env node
import { Cppa2025Connector } from '../src/ingestion/sources/cppa-2025.ts';

if (!process.argv.includes('--dry-run')) {
  console.error('This command only supports --dry-run. It never writes to D1.');
  process.exitCode = 2;
} else {
  const startedAt = new Date().toISOString();
  const runId = crypto.randomUUID();
  let records = 0;

  try {
    for await (const observation of new Cppa2025Connector().collect({
      runId,
      observedAt: startedAt,
    })) {
      records += 1;
      if (records % 100 === 0) console.error(`Validated ${records} records…`);
      // Deliberately discard registry values: this preview does not retain a copy.
      void observation;
    }
    console.log(
      JSON.stringify(
        {
          sourceId: 'cppa-2025',
          sourceUrl: 'https://cppa.ca.gov/data_broker_registry/registry2025.csv',
          runId,
          observedAt: startedAt,
          recordsValidated: records,
          persistence: 'skipped; source reuse review is required',
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
