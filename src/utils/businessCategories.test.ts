import { completeBusinessSettings, defaultBusinessSettings } from './businessCategories';
import { BUSINESS_CATEGORIES } from 'interfaces/SponsorItem';

it('classifies every existing category exactly once', () => {
  const settings = defaultBusinessSettings([...BUSINESS_CATEGORIES]);
  expect(settings.groups.flatMap(group => group.categories).sort()).toEqual([...BUSINESS_CATEGORIES].sort());
  expect(settings.groups.find(group => group.name === 'Alimentos / Bebidas')?.categories).toContain('Restaurantes/Sodas');
});
it('preserves custom icons and groups, and includes unassigned historical categories', () => {
  const settings = completeBusinessSettings(['Sodas', 'Nueva'], { groups: [{ name: 'Comida', icon: '🥗', categories: ['Sodas', 'Eliminada'] }], icons: { Sodas: '🍲' } });
  expect(settings.groups[0]).toEqual(expect.objectContaining({ name: 'Comida', icon: '🥗', categories: ['Sodas'] }));
  expect(settings.groups[1].categories).toEqual(['Nueva']);
  expect(settings.icons.Sodas).toBe('🍲');
});
