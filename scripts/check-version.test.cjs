const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { checkVersion } = require('./check-version.cjs');

function fixture(t, overrides = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'progas-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = {
    'package.json': { version: '1.3.2' },
    'package-lock.json': { version: '1.3.2', packages: { '': { version: '1.3.2' } } },
    '.release-please-manifest.json': { '.': '1.3.2' },
    'CHANGELOG.md': '## [1.3.2](https://example.com/compare) (2026-11-11)\n\n### Corregido\n',
    ...overrides,
  };
  for (const [name, value] of Object.entries(files)) {
    writeFileSync(path.join(root, name), typeof value === 'string' ? value : JSON.stringify(value));
  }
  return root;
}

test('accepts a Release Please changelog and matching versions', t => {
  assert.equal(checkVersion(fixture(t)), '1.3.2');
});
test('accepts the historical pending-publication format', t => {
  assert.equal(checkVersion(fixture(t, { 'CHANGELOG.md': '## [1.3.2] — Pendiente de publicación\n' })), '1.3.2');
});
for (const field of ['version', 'rootPackage']) {
  test(`rejects a mismatched lockfile ${field}`, t => {
    const lock = { version: '1.3.2', packages: { '': { version: '1.3.2' } } };
    if (field === 'version') lock.version = '1.3.1';
    else lock.packages[''].version = '1.3.1';
    assert.throws(() => checkVersion(fixture(t, { 'package-lock.json': lock })), /se esperaba 1.3.2/);
  });
}
test('rejects a mismatched release manifest', t => {
  assert.throws(() => checkVersion(fixture(t, { '.release-please-manifest.json': { '.': '1.3.1' } })), /se esperaba 1.3.2/);
});
test('rejects a changelog that only mentions the current version in an older entry', t => {
  assert.throws(() => checkVersion(fixture(t, { 'CHANGELOG.md': '## [1.3.3]\n\n## [1.3.2]\n' })), /primera entrada/);
});
test('rejects invalid SemVer', t => {
  assert.throws(() => checkVersion(fixture(t, { 'package.json': { version: '1.3' } })), /MAYOR.MENOR.PARCHE/);
});
