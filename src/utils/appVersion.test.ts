import { buildDescription } from './appVersion';

it('distinguishes previews and production while retaining their exact short revision', () => {
  expect(buildDescription({ context: 'deploy-preview', reviewId: '38', revision: 'a'.repeat(40) })).toBe('Vista previa PR 38 · aaaaaaa');
  expect(buildDescription({ context: 'production', revision: 'b'.repeat(40) })).toBe('Producción · bbbbbbb');
});
it('does not mislabel local or unidentified builds as production', () => {
  expect(buildDescription({})).toBe('Desarrollo local');
  expect(buildDescription({ context: 'build' })).toBe('Compilación · sin revisión');
  expect(buildDescription({ context: 'deploy-preview', reviewId: 'invalid', revision: 'invalid' })).toBe('Vista previa · sin revisión');
});
