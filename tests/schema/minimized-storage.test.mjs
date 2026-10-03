import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');

function wranglerOutput(args) {
  try {
    return execFileSync(process.execPath, [wrangler, ...args], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
  } catch (error) {
    const stdout = error.stdout?.toString() ?? '';
    const stderr = error.stderr?.toString() ?? '';
    throw new Error(`${stdout}\n${stderr}\n${error.message}`);
  }
}

function execute(databasePath, sql) {
  return JSON.parse(
    wranglerOutput([
      'd1',
      'execute',
      'unlisted-dev',
      '--local',
      '--persist-to',
      databasePath,
      '--command',
      sql,
      '--json',
    ]),
  );
}

test('D1 minimized storage migration fails closed and contains no raw row payload', () => {
  const databasePath = mkdtempSync(join(tmpdir(), 'unlisted-d1-migration-'));
  try {
    const migrationOutput = wranglerOutput([
      'd1',
      'migrations',
      'apply',
      'unlisted-dev',
      '--local',
      '--persist-to',
      databasePath,
    ]);
    assert.match(migrationOutput, /0003_reviewed_field_storage\.sql[\s\S]*✅/);

    const inspection = execute(
      databasePath,
      `SELECT COUNT(*) AS policy_count,
         SUM(CASE WHEN storage_status='approved' OR display_status='approved' THEN 1 ELSE 0 END) AS approved_count
       FROM source_field_policy_decisions;
       PRAGMA table_info(minimized_observations);
       SELECT name FROM sqlite_master WHERE type='view' AND name='verified_public_observation_fields';`,
    );
    assert.equal(inspection[0].results[0].policy_count, 5);
    assert.equal(inspection[0].results[0].approved_count, 0);
    assert.ok(
      inspection[1].results.every((column) => column.name !== 'raw_record_json'),
      'minimized observations must not contain a raw-row column',
    );
    assert.equal(inspection[2].results[0].name, 'verified_public_observation_fields');

    execute(
      databasePath,
      `INSERT INTO ingestion_runs (ingestion_run_id, source_id, started_at, status)
       VALUES ('migration-check-run', 'cppa-2025', '2026-10-03T00:00:00.000Z', 'running');`,
    );
    assert.throws(
      () =>
        execute(
          databasePath,
          `INSERT INTO source_observations
            (observation_id, source_id, source_record_key, observed_at, record_hash, raw_record_json, ingestion_run_id)
           VALUES
            ('blocked-raw-observation', 'cppa-2025', 'derived-v1:fixture', '2026-10-03T00:00:00.000Z',
             'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '{}', 'migration-check-run');`,
        ),
      /full source payload is not approved for storage/,
    );
    assert.throws(
      () =>
        execute(
          databasePath,
          `INSERT INTO minimized_observations
            (observation_id, source_id, source_record_key, observed_at, projection_hash, ingestion_run_id)
           VALUES
            ('blocked-observation', 'cppa-2025', 'derived-v1:fixture', '2026-10-03T00:00:00.000Z',
             'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'migration-check-run');`,
        ),
      /source reuse is not approved for storage/,
    );
    assert.throws(
      () =>
        execute(
          databasePath,
          `INSERT INTO source_field_policy_decisions
            (decision_id, source_id, field_key, source_field_label, storage_status, display_status,
             decision_version, reviewer, review_note, decided_at)
           VALUES
            ('blocked-approval', 'cppa-2025', 'broker_name', 'Data broker name', 'approved', 'pending',
             2, 'test', 'must be blocked', '2026-10-03T00:00:00.000Z');`,
        ),
      /source reuse must be approved before field approval/,
    );
  } finally {
    rmSync(databasePath, { recursive: true, force: true });
  }
});
