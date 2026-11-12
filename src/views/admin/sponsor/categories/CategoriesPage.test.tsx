import { categoryId } from 'utils/categories';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CategoryService, { CategoryInUseError } from 'services/CategoryService';
import SponsorService from 'services/SponsorService';
import BusinessCategoriesPage from './index';

jest.setTimeout(20000);

jest.mock('apiConfig', () => ({}));
jest.mock('services/CategoryService', () => ({ __esModule: true, ...jest.requireActual('services/CategoryService'), default: { get: jest.fn(), getBusinessSettings: jest.fn(), saveBusinessSettings: jest.fn(), assertUnused: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('services/SponsorService', () => ({ __esModule: true, default: { getAll: jest.fn() } }));
jest.mock('components/category/EmojiField', () => ({ __esModule: true, default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => <button type="button" onClick={() => onChange('🥐')}>Ícono {value}</button> }));
const setup = async () => {
  (CategoryService.get as jest.Mock).mockResolvedValue(['Sodas', 'Tiendas']);
  (SponsorService.getAll as jest.Mock).mockResolvedValue([]);
  (CategoryService.getBusinessSettings as jest.Mock).mockResolvedValue({ groups: [{ name: 'Comida', icon: '🍽️', categories: ['Sodas'] }, { name: 'Compras', icon: '🛍️', categories: ['Tiendas'] }], icons: { Sodas: '🍲', Tiendas: '🛒' } });
  (CategoryService.saveBusinessSettings as jest.Mock).mockResolvedValue(undefined);
  render(<ChakraProvider><MemoryRouter><BusinessCategoriesPage /></MemoryRouter></ChakraProvider>);
  await screen.findByRole('tab', { name: /Comida/ });
};
beforeEach(() => jest.clearAllMocks());
it('filters specific categories by the selected general tab', async () => {
  await setup();
  expect(screen.getByRole('button', { name: 'Editar Sodas' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Editar Tiendas' })).toBeNull();
  fireEvent.click(screen.getByRole('tab', { name: /Compras/ }));
  expect(screen.getByRole('button', { name: 'Editar Tiendas' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Editar Sodas' })).toBeNull();
});
it('creates a specific category inside the selected tab and saves its single icon', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Nueva específica' }));
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Panaderías' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ícono 🏪' }));
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 5000 });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.saveBusinessSettings).toHaveBeenCalledWith(['Panaderías', 'Sodas', 'Tiendas'], expect.objectContaining({ groups: expect.arrayContaining([expect.objectContaining({ name: 'Comida', categories: ['Panaderías', 'Sodas'] })]), icons: expect.objectContaining({ Panaderías: '🥐' }) })));
});
it('keeps unsaved changes available when saving fails', async () => {
  await setup();
  (CategoryService.saveBusinessSettings as jest.Mock).mockRejectedValue(new Error('offline'));
  fireEvent.click(screen.getByRole('button', { name: 'Editar Sodas' }));
  const parent = screen.getByLabelText('Categoría general');
  const compras = screen.getByRole('option', { name: 'Compras' }) as HTMLOptionElement;
  fireEvent.change(parent, { target: { value: compras.value } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 5000 });
  expect(screen.getByRole('button', { name: 'Editar Sodas' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Editar Tiendas' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await screen.findByText('No se pudieron guardar las categorías');
  expect(screen.getByText('Cambios sin guardar')).toBeTruthy();
});
it('creates a general category as a new tab', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Nueva general' }));
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Servicios' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 5000 });
  const tab = screen.getByRole('tab', { name: /Servicios/ });
  expect(tab.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByText('Todavía no hay categorías específicas')).toBeTruthy();
});
it('rejects duplicate category names before applying', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Nueva específica' }));
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'sodas' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
  expect(screen.getByText('Ya existe una categoría con ese nombre.')).toBeTruthy();
  expect(CategoryService.saveBusinessSettings).not.toHaveBeenCalled();
});

it('allows renaming a specific category without changing its ID or its group', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Editar Sodas' }));
  const name = screen.getByLabelText('Nombre') as HTMLInputElement;
  expect(name.readOnly).toBe(false);
  fireEvent.change(name, { target: { value: 'Restaurantes' } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 5000 });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.saveBusinessSettings).toHaveBeenCalled());
  const settings = (CategoryService.saveBusinessSettings as jest.Mock).mock.calls[0][1];
  const renamed = settings.catalog.find((record: { name: string }) => record.name === 'Restaurantes');
  expect(renamed.id).toBe(categoryId('sponsors', 'Sodas'));
  expect(renamed.aliases).toContain('Sodas');
  expect(settings.groups.find((group: { name: string }) => group.name === 'Comida').categories).toEqual(['Restaurantes']);
});
it('shows general tabs and specific cards in Spanish alphabetical order', async () => {
  await setup();
  expect(screen.getAllByRole('tab').map(tab => tab.textContent?.replace(/\d+$/, ''))).toEqual(['🍽️Comida', '🛍️Compras']);
});

it('removes an unused specific category after confirmation', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Sodas' }));
  fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 5000 });
  expect(screen.queryByRole('button', { name: 'Editar Sodas' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.saveBusinessSettings).toHaveBeenCalledWith(['Tiendas'], expect.objectContaining({ catalog: [expect.objectContaining({ name: 'Tiendas' })] })));
});
it('warns and retains an associated specific category', async () => {
  await setup();
  (CategoryService.assertUnused as jest.Mock).mockRejectedValueOnce(new CategoryInUseError('Sodas'));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Sodas' }));
  fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }));
  await screen.findByText('No se puede eliminar la categoría “Sodas” porque tiene valores asociados.');
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 5000 });
  expect(screen.getByRole('button', { name: 'Editar Sodas' })).toBeTruthy();
  expect(CategoryService.saveBusinessSettings).not.toHaveBeenCalled();
});
it('warns and retains a general category containing specific categories', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar general Comida' }));
  fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }));
  await screen.findByText('No se puede eliminar la categoría “Comida” porque tiene valores asociados.');
  expect(CategoryService.saveBusinessSettings).not.toHaveBeenCalled();
});
it('removes a general category after its unused specific categories have been removed', async () => {
  await setup();
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Sodas' }));
  fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 5000 });
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar general Comida' }));
  fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 5000 });
  expect(screen.queryByRole('tab', { name: /Comida/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.saveBusinessSettings).toHaveBeenCalledWith(['Tiendas'], expect.objectContaining({ groups: [expect.objectContaining({ name: 'Compras' })] })));
});
