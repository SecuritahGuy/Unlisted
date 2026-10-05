import assert from 'node:assert/strict';
import test from 'node:test';
import { getSourcePolicy } from '../../data/source-policies.ts';

test('Cloudflare API source IDs resolve to the same review policy as fallback catalog IDs', () => {
  const aliases = [
    ['cppa-2025', 'cppa'],
    ['oregon-dfr', 'oregon'],
    ['texas-sos', 'texas'],
    ['vermont-sos', 'vermont'],
    ['ca-ag-legacy', 'ca-ag'],
    ['optoutrights-directory', 'optoutrights'],
    ['cvs0-directory', 'cvs0'],
    ['optery-directory', 'optery'],
    ['prc-directory', 'prc'],
  ];

  for (const [apiId, fallbackId] of aliases) {
    assert.deepEqual(getSourcePolicy(apiId), getSourcePolicy(fallbackId));
    assert.ok(getSourcePolicy(apiId)?.reuseLabel);
    assert.ok(getSourcePolicy(apiId)?.evidenceUrl.startsWith('https://'));
  }
});

test('unknown source IDs do not inherit an unrelated reuse policy', () => {
  assert.equal(getSourcePolicy('unreviewed-source'), undefined);
});
