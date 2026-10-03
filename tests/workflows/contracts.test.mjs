import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePublicWorkflowEvidence } from '../../src/workflows/contracts.ts';
import { workflowSamples } from '../../src/workflows/samples.ts';

const validEvidence = () => ({
  schemaVersion: 1,
  evidenceId: 'synthetic-v1',
  subject: { kind: 'broker', id: 'synthetic-broker' },
  action: 'delete',
  channel: 'web_form',
  destinationUrl: 'https://broker.example/privacy',
  agentSupport: 'unclear',
  evidence: {
    sourceUrl: 'https://broker.example/privacy-notice',
    sourceKind: 'broker_privacy_notice',
    observedAt: '2026-10-03T00:00:00.000Z',
  },
  reviewStatus: 'unreviewed',
});

test('curated samples are valid and distinguish actions and scopes', () => {
  assert.equal(workflowSamples.length, 5);
  assert.deepEqual(
    workflowSamples.map(({ subject, action }) => `${subject.id}:${action}`),
    [
      'epsilon:delete',
      'epsilon:opt_out_direct_marketing',
      'lexisnexis-risk-solutions:opt_out_sale_sharing',
      'lexisnexis-risk-solutions:delete',
      'lexisnexis-risk-solutions:suppress',
    ],
  );
  for (const sample of workflowSamples)
    assert.doesNotThrow(() => validatePublicWorkflowEvidence(sample));
});

test('requires versioned identity and HTTPS evidence provenance', () => {
  assert.doesNotThrow(() => validatePublicWorkflowEvidence(validEvidence()));
  assert.throws(
    () => validatePublicWorkflowEvidence({ ...validEvidence(), schemaVersion: 2 }),
    /Unsupported workflow evidence schema version/,
  );
  assert.throws(
    () =>
      validatePublicWorkflowEvidence({
        ...validEvidence(),
        destinationUrl: 'http://broker.example',
      }),
    /destinationUrl must use HTTPS/,
  );
});

test('rejects unmodeled fields so private request payloads cannot enter public workflow evidence', () => {
  assert.throws(
    () =>
      validatePublicWorkflowEvidence({
        ...validEvidence(),
        consumerEmail: 'person@example.invalid',
      }),
    /unsupported field: consumerEmail/,
  );
  assert.throws(
    () =>
      validatePublicWorkflowEvidence({
        ...validEvidence(),
        evidence: { ...validEvidence().evidence, submittedPayload: { fullName: 'Example Person' } },
      }),
    /unsupported field: submittedPayload/,
  );
});

test('validates action, agent, observation date, and digest values', () => {
  assert.throws(
    () => validatePublicWorkflowEvidence({ ...validEvidence(), action: 'submit_request' }),
    /action has an unsupported value/,
  );
  assert.throws(
    () => validatePublicWorkflowEvidence({ ...validEvidence(), agentSupport: 'maybe' }),
    /agentSupport has an unsupported value/,
  );
  assert.throws(
    () =>
      validatePublicWorkflowEvidence({
        ...validEvidence(),
        evidence: { ...validEvidence().evidence, observedAt: 'not-a-date' },
      }),
    /observedAt must be a valid date/,
  );
  assert.throws(
    () =>
      validatePublicWorkflowEvidence({
        ...validEvidence(),
        evidence: { ...validEvidence().evidence, contentDigest: 'not-a-digest' },
      }),
    /contentDigest must be a SHA-256 hex digest/,
  );
});
