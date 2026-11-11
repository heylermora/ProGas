const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const { checkVersion } = require('./check-version.cjs');

function buildMetadata(env, gitRevision = '') {
  const revision = [env.COMMIT_REF, env.GITHUB_SHA, env.REACT_APP_BUILD_REVISION, gitRevision]
    .find(value => typeof value === 'string' && /^[a-f0-9]{7,40}$/i.test(value.trim())) || '';
  const requestedContext = env.CONTEXT || env.REACT_APP_BUILD_CONTEXT || (env.GITHUB_EVENT_NAME === 'pull_request' ? 'deploy-preview' : 'build');
  const context = ['production', 'deploy-preview', 'branch-deploy', 'build'].includes(requestedContext) ? requestedContext : 'build';
  const reviewId = env.REVIEW_ID || env.GITHUB_REF?.match(/^refs\/pull\/(\d+)\//)?.[1] || '';
  return {
    REACT_APP_BUILD_REVISION: revision.trim().toLowerCase(),
    REACT_APP_BUILD_CONTEXT: context,
    REACT_APP_BUILD_REVIEW_ID: /^\d+$/.test(reviewId) ? reviewId : '',
  };
}
module.exports = { buildMetadata };
if (require.main === module) {
  try {
    const root = path.resolve(__dirname, '..');
    const version = checkVersion(root);
    let revision = '';
    try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* Source archives may not contain Git metadata. */ }
    const metadata = buildMetadata(process.env, revision);
    console.log(`Compilando ProGas ${version} · ${metadata.REACT_APP_BUILD_CONTEXT} · ${metadata.REACT_APP_BUILD_REVISION.slice(0, 7) || 'sin revisión'}`);
    const result = spawnSync(process.execPath, [require.resolve('react-scripts/scripts/build')], { cwd: root, stdio: 'inherit', env: { ...process.env, ...metadata } });
    if (result.error) throw result.error;
    process.exitCode = result.status === null ? 1 : result.status;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
