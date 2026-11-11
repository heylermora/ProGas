import { addData, fetchAllData, fetchAllPages, fetchDataById, updateData, upsertData } from 'apiConfig';
import CategoryService from './CategoryService';
import SponsorService from './SponsorService';
import ProductService from './ProductService';
import { completeBusinessSettings } from 'utils/businessCategories';
import { categoryId, renameCategory } from 'utils/categories';

jest.mock('apiConfig', () => ({ addData: jest.fn(), fetchAllData: jest.fn(), fetchAllPages: jest.fn(), fetchDataById: jest.fn(), updateData: jest.fn(), upsertData: jest.fn(), deleteData: jest.fn() }));
let settings: Record<string, unknown>;
beforeEach(() => {
  jest.clearAllMocks();
  settings = { sponsors: { values: ['Sodas'], businessSettings: { groups: [{ name: 'Comida', icon: '🍽️', categories: ['Sodas'] }], icons: { Sodas: '🍲' } } }, products: { values: ['Gas'] } };
  (fetchDataById as jest.Mock).mockImplementation((collection, id) => collection === 'CategorySettings' ? settings[id] : { id, category: 'Sodas', name: 'Local', order: 3 });
  (upsertData as jest.Mock).mockImplementation((_collection, id, data) => { settings[id] = data; });
  (fetchAllData as jest.Mock).mockResolvedValue([{ id: 'local', name: 'Local', category: 'Sodas', order: 3 }]);
});
it('persists general and specific IDs, and reads a renamed category without losing historical businesses', async () => {
  const before = await CategoryService.getBusinessSettings(['Sodas']);
  const id = before.catalog[0].id;
  const generalId = before.groups[0].id;
  const renamed = completeBusinessSettings(['Restaurantes'], { catalog: renameCategory(before.catalog, id, 'Restaurantes'), groups: [{ ...before.groups[0], name: 'Gastronomía', categories: ['Restaurantes'] }], icons: before.icons });
  await CategoryService.saveBusinessSettings(['Restaurantes'], renamed);
  expect(upsertData).toHaveBeenCalledWith('CategorySettings', 'sponsors', expect.objectContaining({ catalog: [expect.objectContaining({ id, name: 'Restaurantes', aliases: ['Sodas'] })], businessSettings: expect.objectContaining({ icons: { [id]: '🍲' }, groups: [expect.objectContaining({ id: generalId, name: 'Gastronomía', categoryIds: [id] })] }) }));
  const reread = await CategoryService.getBusinessSettings(['Sodas']);
  expect(reread.catalog).toHaveLength(1);
  expect(reread.groups[0]).toEqual(expect.objectContaining({ id: generalId, categories: ['Restaurantes'] }));
  expect((await SponsorService.getAll())[0]).toEqual(expect.objectContaining({ categoryId: id, category: 'Restaurantes' }));
  await SponsorService.create({ name: 'Nuevo', category: 'Restaurantes', active: true, order: 0, logoUrl: '', links: [] });
  expect(addData).toHaveBeenCalledWith('Sponsors', expect.objectContaining({ categoryId: id, category: 'Restaurantes', order: 4 }));
  expect(await SponsorService.getPublicByCategory('Sodas')).toHaveLength(1);
});
it('preserves product category IDs and resolves old product names after renaming', async () => {
  const id = categoryId('products', 'Gas');
  await CategoryService.save('products', ['Cilindros'], { Gas: 'Cilindros' });
  (fetchAllPages as jest.Mock).mockResolvedValue([{ id: 'p', category: 'Gas' }]);
  expect((await ProductService.getAllPages())[0]).toEqual({ id: 'p', category: 'Cilindros', categoryId: id });
  await ProductService.edit('p', { id: 'p', description: 'Gas', price: 1, costPrice: 0, stock: 1, active: true, category: 'Gas', categoryId: id });
  expect(updateData).toHaveBeenCalledWith('Products', 'p', expect.objectContaining({ categoryId: id, category: 'Cilindros' }));
});
it('does not hide read failures behind defaults when saving category metadata', async () => {
  (fetchDataById as jest.Mock).mockRejectedValue(new Error('Sin conexión'));
  await expect(CategoryService.save('products', ['Gas'])).rejects.toThrow('Sin conexión');
  expect(upsertData).not.toHaveBeenCalled();
});
