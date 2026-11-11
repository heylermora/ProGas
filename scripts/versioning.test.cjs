const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { checkVersion } = require('./check-version.cjs');
const { buildMetadata } = require('./build-app.cjs');

function fixture(t, changes = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'progas-version-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ version: changes.version || '1.2.0' }));
  fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ version: changes.lock || '1.2.0', packages: { '': { version: changes.rootLock || '1.2.0' } } }));
  fs.writeFileSync(path.join(root, 'CHANGELOG.md'), changes.changelog ?? '## [1.2.0] — Pendiente de publicación\n');
  return root;
}
test('accepts a synchronized pending release', t => assert.equal(checkVersion(fixture(t)), '1.2.0'));
test('blocks an inconsistent lockfile', t => {
  assert.throws(() => checkVersion(fixture(t, { lock: '1.1.0' })), /misma versión/);
  assert.throws(() => checkVersion(fixture(t, { rootLock: '1.1.0' })), /misma versión/);
});
test('requires a release entry and a semantic release number', t => {
  assert.throws(() => checkVersion(fixture(t, { changelog: '## [1.1.0] — Publicada\n' })), /Falta la entrada/);
  assert.throws(() => checkVersion(fixture(t, { version: '1.2' })), /MAYOR.MENOR.PARCHE/);
});
test('uses the Netlify revision and preview ID rather than unrelated CI values', () => {
  assert.deepEqual(buildMetadata({ COMMIT_REF: 'a'.repeat(40), GITHUB_SHA: 'b'.repeat(40), CONTEXT: 'deploy-preview', REVIEW_ID: '38' }, 'c'.repeat(40)), {
    REACT_APP_BUILD_REVISION: 'a'.repeat(40), REACT_APP_BUILD_CONTEXT: 'deploy-preview', REACT_APP_BUILD_REVIEW_ID: '38',
  });
});
test('labels production only when the build environment explicitly says so', () => {
  assert.equal(buildMetadata({ CONTEXT: 'production' }).REACT_APP_BUILD_CONTEXT, 'production');
  assert.equal(buildMetadata({}).REACT_APP_BUILD_CONTEXT, 'build');
  assert.equal(buildMetadata({ CONTEXT: 'unknown' }).REACT_APP_BUILD_CONTEXT, 'build');
});
test('supports GitHub previews and Git fallback without inventing a revision', () => {
  assert.equal(buildMetadata({ GITHUB_EVENT_NAME: 'pull_request', GITHUB_REF: 'refs/pull/38/merge', GITHUB_SHA: 'b'.repeat(40) }).REACT_APP_BUILD_REVIEW_ID, '38');
  assert.equal(buildMetadata({}, 'c'.repeat(40)).REACT_APP_BUILD_REVISION, 'c'.repeat(40));
  assert.equal(buildMetadata({ COMMIT_REF: 'invalid' }).REACT_APP_BUILD_REVISION, '');
});
