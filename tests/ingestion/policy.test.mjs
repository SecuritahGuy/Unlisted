import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertFieldDisplayAllowed,
  cppa2025ProposedFields,
  projectApprovedFields,
} from '../../src/ingestion/field-policy.ts';
import { cppa2025Manifest } from '../../src/ingestion/sources/cppa-2025.ts';
import {
  assertProductionPersistenceAllowed,
  validateSourceManifest,
} from '../../src/ingestion/validation.ts';

const approvedManifest = (overrides = {}) => ({
  ...cppa2025Manifest,
  id: 'approved-fixture',
  name: 'Approved synthetic source',
  licenseStatus: 'approved',
  licenseName: 'Synthetic test license',
  ...overrides,
});

test('production persistence rejects every source status except approved', () => {
  for (const licenseStatus of ['unknown', 'review-required', 'restricted', 'prohibited']) {
    const manifest = approvedManifest({ licenseStatus });

    assert.throws(
      () => assertProductionPersistenceAllowed(manifest),
      new RegExp(`not approved for production persistence \\(status: ${licenseStatus}\\)`),
    );
  }
});

test('CPPA 2025 source remains blocked while reuse review is unresolved', () => {
  assert.equal(cppa2025Manifest.licenseStatus, 'review-required');
  assert.throws(
    () => assertProductionPersistenceAllowed(cppa2025Manifest),
    /not approved for production persistence \(status: review-required\)/,
  );
});

test('approved persistence requires a named license and accepts a valid reviewed source', () => {
  assert.throws(
    () => validateSourceManifest(approvedManifest({ licenseName: undefined })),
    /Approved sources must name the reviewed license/,
  );

  assert.doesNotThrow(() => assertProductionPersistenceAllowed(approvedManifest()));
});

test('CPPA proposed projection remains blocked at source and field level', () => {
  assert.throws(
    () =>
      projectApprovedFields(
        cppa2025Manifest,
        { 'Data broker name': 'Synthetic LLC' },
        cppa2025ProposedFields,
      ),
    /not approved for production persistence/,
  );
  assert.throws(
    () =>
      projectApprovedFields(
        approvedManifest({ id: 'cppa-2025' }),
        { 'Data broker name': 'Synthetic LLC' },
        cppa2025ProposedFields,
      ),
    /no nonblank fields approved for storage/,
  );
});

test('field projection emits only approved nonblank fields from its explicit allowlist', () => {
  const source = approvedManifest({ id: 'cppa-2025' });
  const decisions = cppa2025ProposedFields.map((decision) => ({ ...decision }));
  decisions[0].storageStatus = 'approved';
  decisions[1].storageStatus = 'approved';
  const projected = projectApprovedFields(
    source,
    {
      'Data broker name': ' Synthetic LLC ',
      'Doing Business As (DBA), if applicable': '   ',
      'Data broker primary contact email address': 'owner@example.invalid',
      'Sensitive unreviewed field': 'must not be copied',
    },
    decisions,
  );

  assert.deepEqual(projected, [
    {
      fieldKey: 'broker_name',
      value: 'Synthetic LLC',
      sourceFieldLabel: 'Data broker name',
    },
  ]);
});

test('public field display requires verified broker and separate storage/display approvals', () => {
  const source = approvedManifest({ id: 'cppa-2025' });
  const approvedField = {
    ...cppa2025ProposedFields[0],
    storageStatus: 'approved',
    displayStatus: 'approved',
  };

  assert.throws(
    () => assertFieldDisplayAllowed(source, approvedField, 'unreviewed'),
    /Broker must be verified/,
  );
  assert.throws(
    () => assertFieldDisplayAllowed(source, cppa2025ProposedFields[0], 'verified'),
    /Field is not approved for public display/,
  );
  assert.doesNotThrow(() => assertFieldDisplayAllowed(source, approvedField, 'verified'));
});
