const fs = require('fs');
const path = require('path');

function checkVersion(root = path.resolve(__dirname, '..')) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(pkg.version)) throw new Error('La versión debe usar MAYOR.MENOR.PARCHE.');
  if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) throw new Error('package.json y package-lock.json deben tener la misma versión.');
  const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
  if (!changelog.split(/\r?\n/).some(line => line.startsWith(`## [${pkg.version}] — `))) throw new Error(`Falta la entrada ${pkg.version} en CHANGELOG.md.`);
  return pkg.version;
}
module.exports = { checkVersion };
if (require.main === module) {
  try { console.log(`Versión ${checkVersion()}: npm e historial coherentes.`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
