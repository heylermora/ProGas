import { addData, fetchAllData, updateData } from 'apiConfig';
import SponsorService from './SponsorService';

jest.mock('apiConfig', () => ({ addData: jest.fn(), fetchAllData: jest.fn(), fetchDataById: jest.fn(), updateData: jest.fn(), deleteData: jest.fn() }));

it('appends new sponsors after the last position in their category', async () => {
  (fetchAllData as jest.Mock).mockResolvedValue([
    { id: 'a', name: 'A', category: 'Tiendas', order: 2 },
    { id: 'b', name: 'B', category: 'Tiendas', order: 8 },
    { id: 'c', name: 'C', category: 'Otros', order: 90 },
  ]);
  await SponsorService.create({ name: 'Nuevo', category: 'Tiendas', order: 1, active: true, logoUrl: '', links: [] });
  expect(addData).toHaveBeenCalledWith('Sponsors', expect.objectContaining({ order: 9 }));
  expect(await SponsorService.nextOrder('Restaurantes/Sodas')).toBe(1);
});

beforeEach(() => jest.clearAllMocks());

it.each(['', '   ', '\t\n', '\u00a0', undefined, null, 42])('rejects invalid names before any create or update: %j', async name => {
  const item = { name, category: 'Otros', order: 1, active: true, logoUrl: '', links: [] as string[] } as unknown as Parameters<typeof SponsorService.create>[0];
  await expect(SponsorService.create(item)).rejects.toThrow('Ingrese el nombre del negocio.');
  await expect(SponsorService.edit('one', { ...item, id: 'one' })).rejects.toThrow('Ingrese el nombre del negocio.');
  expect(addData).not.toHaveBeenCalled();
  expect(updateData).not.toHaveBeenCalled();
  expect(fetchAllData).not.toHaveBeenCalled();
});

it('trims the business name on creation and update', async () => {
  (fetchAllData as jest.Mock).mockResolvedValue([]);
  const item: Parameters<typeof SponsorService.create>[0] = { name: '  Comercio Central  ', category: 'Otros', order: 1, active: true, logoUrl: '', links: [] };
  await SponsorService.create(item);
  await SponsorService.edit('one', { ...item, id: 'one' });
  expect(addData).toHaveBeenCalledWith('Sponsors', expect.objectContaining({ name: 'Comercio Central' }));
  expect(updateData).toHaveBeenCalledWith('Sponsors', 'one', expect.objectContaining({ name: 'Comercio Central' }));
});

it('persists multiple memberships and returns a business once for either category', async () => {
  (fetchAllData as jest.Mock).mockResolvedValue([]);
  const item = { name: 'Mixto', category: 'Tiendas', categories: ['Tiendas', 'Cafeterías'], order: 1, active: true, logoUrl: '', links: [] as string[] };
  await SponsorService.create(item);
  const saved = (addData as jest.Mock).mock.calls[0][1];
  expect(saved.categories).toEqual(['Tiendas', 'Cafeterías']);
  expect(saved.categoryIds).toHaveLength(2);
  await SponsorService.edit('one', { ...saved, id: 'one', name: 'Nuevo nombre' });
  expect(updateData).toHaveBeenCalledWith('Sponsors', 'one', expect.objectContaining({ categories: saved.categories, categoryIds: saved.categoryIds }));
  (fetchAllData as jest.Mock).mockResolvedValue([{ ...saved, id: 'one' }, { ...saved, id: 'hidden', active: false }]);
  expect((await SponsorService.getPublicByCategory('Tiendas')).map(item => item.id)).toEqual(['one']);
  expect((await SponsorService.getPublicByCategory('Cafeterías')).map(item => item.id)).toEqual(['one']);
});

it('rejects empty category selections on both create and update', async () => {
  const item = { name: 'Local', category: 'Tiendas', categories: [] as string[], order: 1, active: true, logoUrl: '', links: [] as string[] };
  await expect(SponsorService.create(item)).rejects.toThrow('Seleccione al menos una categoría específica.');
  await expect(SponsorService.edit('one', { ...item, id: 'one' })).rejects.toThrow('Seleccione al menos una categoría específica.');
  expect(addData).not.toHaveBeenCalled();
  expect(updateData).not.toHaveBeenCalled();
});
