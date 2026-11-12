import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import CategoryService, { CategoryInUseError } from 'services/CategoryService';
import CategoryManager from './CategoryManager';

jest.mock('services/CategoryService', () => ({
  __esModule: true,
  ...jest.requireActual('services/CategoryService'),
  default: { save: jest.fn().mockResolvedValue(undefined), assertUnused: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('apiConfig', () => ({}));
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({ ...jest.requireActual('@chakra-ui/react'), useToast: () => mockToast }));
beforeEach(() => jest.clearAllMocks());

it('confirms a renamed category with Enter before saving the complete list', async () => {
  render(<ChakraProvider><CategoryManager kind="products" categories={['Gas', 'Accesorios', 'Otros', 'Promociones', 'Servicios', 'Hogar']}
    isOpen onClose={jest.fn()} onSaved={jest.fn()} /></ChakraProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Renombrar Gas' }));
  expect((screen.getByRole('button', { name: 'Guardar cambios' }) as HTMLButtonElement).disabled).toBe(true);
  const input = screen.getByRole('textbox', { name: 'Nombre de Gas' });
  fireEvent.change(input, { target: { value: 'Cilindros' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.save).toHaveBeenCalledWith('products', ['Accesorios', 'Cilindros', 'Hogar', 'Otros', 'Promociones', 'Servicios'], { Gas: 'Cilindros' }));
});

it.each(['products', 'sponsors'] as const)('confirms and removes an unused %s category', async kind => {
  render(<ChakraProvider><CategoryManager kind={kind} categories={['Gas']} isOpen onClose={jest.fn()} onSaved={jest.fn()} /></ChakraProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Gas' }));
  const dialog = await screen.findByRole('alertdialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Eliminar Gas' })).toBeNull());
  expect(CategoryService.assertUnused).toHaveBeenCalledWith(kind, ['Gas']);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.save).toHaveBeenCalledWith(kind, [], {}));
});

it.each([new CategoryInUseError('Gas'), new Error('read failed')])('keeps the category when validation fails: %s', async error => {
  (CategoryService.assertUnused as jest.Mock).mockRejectedValueOnce(error);
  render(<ChakraProvider><CategoryManager kind="products" categories={['Gas']} isOpen onClose={jest.fn()} onSaved={jest.fn()} /></ChakraProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar Gas' }));
  fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull(), { timeout: 5000 });
  expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ status: error instanceof CategoryInUseError ? 'warning' : 'error' }));
  expect(screen.getByRole('button', { name: 'Eliminar Gas' })).toBeTruthy();
  expect(CategoryService.save).not.toHaveBeenCalled();
});
