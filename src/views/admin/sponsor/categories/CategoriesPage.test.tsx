import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CategoryService from 'services/CategoryService';
import SponsorService from 'services/SponsorService';
import BusinessCategoriesPage from './index';

jest.setTimeout(20000);

jest.mock('services/CategoryService', () => ({ __esModule: true, default: { get: jest.fn(), getBusinessSettings: jest.fn(), saveBusinessSettings: jest.fn() } }));
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
  await waitFor(() => expect(CategoryService.saveBusinessSettings).toHaveBeenCalledWith(['Sodas', 'Tiendas', 'Panaderías'], expect.objectContaining({ groups: expect.arrayContaining([expect.objectContaining({ name: 'Comida', categories: ['Sodas', 'Panaderías'] })]), icons: expect.objectContaining({ Panaderías: '🥐' }) })));
});
it('keeps unsaved changes available when saving fails', async () => {
  await setup();
  (CategoryService.saveBusinessSettings as jest.Mock).mockRejectedValue(new Error('offline'));
  fireEvent.click(screen.getByRole('button', { name: 'Editar Sodas' }));
  fireEvent.change(screen.getByLabelText('Categoría general'), { target: { value: 'Compras' } });
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
