import packageInfo from '../../package.json';

export const appVersion = packageInfo.version;

type BuildInfo = { context?: string; revision?: string; reviewId?: string };
export function buildDescription({ context, revision, reviewId }: BuildInfo): string {
  const labels: Record<string, string> = {
    production: 'Producción', 'deploy-preview': 'Vista previa', 'branch-deploy': 'Rama de pruebas', build: 'Compilación',
  };
  let label = labels[context] || 'Desarrollo local';
  if (context === 'deploy-preview' && /^\d+$/.test(reviewId || '')) label += ` PR ${reviewId}`;
  if (/^[a-f0-9]{7,40}$/i.test(revision || '')) label += ` · ${revision.slice(0, 7).toLowerCase()}`;
  else if (context && labels[context]) label += ' · sin revisión';
  return label;
}
export const deployedBuild = buildDescription({
  context: process.env.REACT_APP_BUILD_CONTEXT,
  revision: process.env.REACT_APP_BUILD_REVISION,
  reviewId: process.env.REACT_APP_BUILD_REVIEW_ID,
});
