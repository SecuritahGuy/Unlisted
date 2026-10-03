import assert from 'node:assert/strict';
import test from 'node:test';
import { Cppa2025Connector } from '../../src/ingestion/sources/cppa-2025.ts';

const csvFixture = (entries = [['Example, Incorporated', 'https://example.invalid']]) => {
  const headers = [
    'Data broker name',
    'Doing Business As (DBA), if applicable',
    'Data broker primary website',
    ...Array.from({ length: 64 }, (_, index) => `Synthetic field ${index + 4}`),
  ];
  const metadata = headers.map(() => 'Guidance row; not a broker record');
  const records = entries.map(([name, website, dba = '', extra = '']) => {
    const record = headers.map((_, index) => `value-${index + 1}`);
    record[0] = name;
    record[1] = dba;
    record[2] = website;
    if (extra) record[3] = extra;
    return record;
  });
  const csvRow = (cells) => cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',');
  return `\uFEFF${csvRow(metadata)}\r\n${csvRow(headers)}\r\n${records.map(csvRow).join('\r\n')}\r\n`;
};

function connectorFor(body, headers = { 'content-type': 'text/csv; charset=utf-8' }, status = 200) {
  return new Cppa2025Connector(async (input, init) => {
    assert.equal(String(input), 'https://cppa.ca.gov/data_broker_registry/registry2025.csv');
    assert.equal(init.headers.accept, 'text/csv');
    return new Response(body, { status, headers });
  });
}

test('skips metadata before the BOM-prefixed 67-column header and emits valid observations', async () => {
  const emitted = [];
  for await (const observation of connectorFor(csvFixture()).collect({
    runId: 'fixture-run',
    observedAt: '2026-10-03T00:00:00.000Z',
  }))
    emitted.push(observation);

  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].sourceId, 'cppa-2025');
  assert.equal(emitted[0].rawRecord['Data broker name'], 'Example, Incorporated');
  assert.equal(emitted[0].rawRecord['Synthetic field 67'], 'value-67');
  assert.match(emitted[0].sourceRecordKey, /^derived-v1:[a-f0-9]{64}$/);
  assert.match(emitted[0].recordHash, /^[a-f0-9]{64}$/);
});

async function collectKeys(body) {
  const keys = [];
  for await (const observation of connectorFor(body).collect({
    runId: 'fixture-run',
    observedAt: '2026-10-03T00:00:00.000Z',
  }))
    keys.push(observation.sourceRecordKey);
  return keys;
}

test('derived keys are stable across row order and unrelated field edits', async () => {
  const first = await collectKeys(
    csvFixture([
      ['Alpha LLC', 'https://alpha.invalid', 'Alpha'],
      ['Beta LLC', 'https://beta.invalid', 'Beta', 'before'],
    ]),
  );
  const reorderedAndEdited = await collectKeys(
    csvFixture([
      ['Beta LLC', 'https://beta.invalid', 'Beta', 'after'],
      ['Alpha LLC', 'https://alpha.invalid', 'Alpha'],
    ]),
  );
  assert.deepEqual(first, [...reorderedAndEdited].reverse());
});

test('uses website host only to disambiguate repeated name and DBA pairs', async () => {
  const keys = await collectKeys(
    csvFixture([
      ['Shared LLC', 'https://one.invalid/path', 'Shared'],
      ['Shared LLC', 'https://two.invalid/path', 'Shared'],
    ]),
  );
  assert.notEqual(keys[0], keys[1]);
});

test('rejects duplicate identity fields that remain ambiguous after host fallback', async () => {
  await assert.rejects(async () => {
    await collectKeys(
      csvFixture([
        ['Shared LLC', 'https://same.invalid/first', 'Shared'],
        ['Shared LLC', 'https://same.invalid/second', 'Shared'],
      ]),
    );
  }, /duplicate broker identity fields/);
});

test('rejects a non-CSV response instead of parsing an HTML error page', async () => {
  await assert.rejects(async () => {
    for await (const _observation of connectorFor('<html>error</html>', {
      'content-type': 'text/html',
    }).collect({ runId: 'fixture-run', observedAt: '2026-10-03T00:00:00Z' })) {
    }
  }, /unexpected content type/);
});

test('rejects unexpected row widths and an empty registry', async () => {
  const context = { runId: 'fixture-run', observedAt: '2026-10-03T00:00:00Z' };
  await assert.rejects(async () => {
    for await (const _observation of connectorFor(
      '\uFEFFData broker name,Data broker primary website\nName,https://example.invalid,extra\n',
    ).collect(context)) {
    }
  }, /has 3 cells; expected 2/);
  await assert.rejects(async () => {
    for await (const _observation of connectorFor(
      '\uFEFFData broker name,Data broker primary website\n',
    ).collect(context)) {
    }
  }, /no broker records/);
});
