import assert from 'node:assert/strict';
import test from 'node:test';
import { Cppa2025Connector } from '../../src/ingestion/sources/cppa-2025.ts';

const csvFixture = () => {
  const headers = [
    'Data broker name',
    'Data broker primary website',
    ...Array.from({ length: 65 }, (_, index) => `Synthetic field ${index + 3}`),
  ];
  const metadata = headers.map(() => 'Guidance row; not a broker record');
  const record = headers.map((_, index) => `value-${index + 1}`);
  record[0] = 'Example, Incorporated';
  record[1] = 'https://example.invalid';
  const csvRow = (cells) => cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',');
  return `\uFEFF${csvRow(metadata)}\r\n${csvRow(headers)}\r\n${csvRow(record)}\r\n`;
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
  assert.match(emitted[0].recordHash, /^[a-f0-9]{64}$/);
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
