import { completeCatalog, renameCategory } from './categories';
import { hasSponsorCategory, resolveSponsorCategories, sponsorCategories } from './sponsorCategories';

it('reads legacy single categories without requiring a data migration', () => {
  const item = { category: 'Sodas' };
  const resolved = resolveSponsorCategories(item, completeCatalog('sponsors', ['Sodas']));
  expect(resolved).toEqual(expect.objectContaining({ category: 'Sodas', categories: ['Sodas'], categoryIds: [resolved.categoryId] }));
  expect(hasSponsorCategory(item, 'Sodas')).toBe(true);
});

it('preserves all category identities through renaming and removes duplicate memberships', () => {
  const original = completeCatalog('sponsors', ['Sodas', 'Tiendas']);
  const ids = ['Sodas', 'Tiendas'].map(name => original.find(record => record.name === name).id);
  const renamed = renameCategory(renameCategory(original, ids[0], 'Restaurantes'), ids[1], 'Comercios');
  const resolved = resolveSponsorCategories({ category: 'Sodas', categories: ['Sodas', 'Tiendas', 'Sodas'], categoryIds: [ids[0], ids[1], ids[0]] }, renamed);
  expect(resolved.categories).toEqual(['Restaurantes', 'Comercios']);
  expect(resolved.categoryIds).toEqual(ids);
  expect(sponsorCategories(resolved)).toEqual(['Restaurantes', 'Comercios']);
  expect(hasSponsorCategory(resolved, 'Comercios')).toBe(true);
});

it('does not silently reassign an unknown explicit ID based on its label', () => {
  const resolved = resolveSponsorCategories({ category: 'Sodas', categoryId: 'historical-id' }, completeCatalog('sponsors', ['Sodas']));
  expect(resolved.categoryIds).toEqual(['historical-id']);
});

it('rejects removing all categories instead of restoring the old primary category', () => {
  expect(() => resolveSponsorCategories({ category: 'Sodas', categories: [] }, completeCatalog('sponsors', ['Sodas']))).toThrow('Seleccione al menos una categoría específica.');
});
