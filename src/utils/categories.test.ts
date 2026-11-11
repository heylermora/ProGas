import { categoryId, completeCatalog, renameCategory, resolveCategory, sortCategories } from './categories';
it('sorts Spanish names, accents and numbers without mutating its input', () => {
  const names = ['Zapatos', 'Ñandú', 'Árbol', 'Negocio 10', 'Negocio 2', 'naranja'];
  expect(sortCategories(names)).toEqual(['Árbol', 'naranja', 'Negocio 2', 'Negocio 10', 'Ñandú', 'Zapatos']);
  expect(names[0]).toBe('Zapatos');
});
it('keeps identity across repeated renames and resolves ID-based and historical items', () => {
  let records = completeCatalog('sponsors', ['Sodas']);
  const id = records[0].id;
  records = renameCategory(records, id, 'Restaurantes');
  records = renameCategory(records, id, 'Alimentos');
  expect(resolveCategory({ category: 'Sodas' }, records)).toEqual({ category: 'Alimentos', categoryId: id });
  expect(resolveCategory({ category: 'Restaurantes', categoryId: id }, records)).toEqual({ category: 'Alimentos', categoryId: id });
  expect(completeCatalog('sponsors', ['Sodas', 'Restaurantes'], records)).toHaveLength(1);
});
it('does not allow another category to take a historical name', () => {
  const records = renameCategory(completeCatalog('sponsors', ['Sodas', 'Tiendas']), categoryId('sponsors', 'Sodas'), 'Restaurantes');
  expect(() => renameCategory(records, categoryId('sponsors', 'Tiendas'), 'sodas')).toThrow();
});
it('does not reassign an unknown explicit ID using its label', () => {
  const item = { category: 'Sodas', categoryId: 'deleted-id' };
  expect(resolveCategory(item, completeCatalog('sponsors', ['Sodas']))).toEqual(item);
});
