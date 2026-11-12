const { readFileSync } = require('node:fs');
const path = require('node:path');

function checkVersion(root = path.resolve(__dirname, '..')) {
  const readJson = name => JSON.parse(readFileSync(path.join(root, name), 'utf8'));
  const version = readJson('package.json').version;
  const lock = readJson('package-lock.json');
  const manifest = readJson('.release-please-manifest.json');
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('La versión debe usar MAYOR.MENOR.PARCHE.');
  for (const [name, actual] of Object.entries({
    'package-lock.json.version': lock.version,
    'package-lock.json.packages[""].version': lock.packages?.['']?.version,
    '.release-please-manifest.json': manifest['.'],
  })) {
    if (actual !== version) throw new Error(`${name}: ${actual}; se esperaba ${version}.`);
  }
  const changelog = readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
  const latest = changelog.match(/^##\s+\[?(\d+\.\d+\.\d+)(?=[\]\s(])/m)?.[1];
  if (latest !== version) throw new Error(`La primera entrada de CHANGELOG.md debe corresponder a ${version}.`);
  return version;
}

if (require.main === module) {
  try { console.log(`Versión consistente: ${checkVersion()}`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { checkVersion };
