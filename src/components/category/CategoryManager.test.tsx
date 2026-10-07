import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CategoryService from 'services/CategoryService';
import CategoryManager from './CategoryManager';

jest.mock('services/CategoryService', () => ({ __esModule: true, default: { save: jest.fn().mockResolvedValue(undefined) } }));

it('confirms a renamed category with Enter before saving the complete list', async () => {
  render(<ChakraProvider><CategoryManager kind="products" categories={['Gas', 'Accesorios', 'Otros', 'Promociones', 'Servicios', 'Hogar']}
    isOpen onClose={jest.fn()} onSaved={jest.fn()} /></ChakraProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Renombrar Gas' }));
  expect((screen.getByRole('button', { name: 'Guardar cambios' }) as HTMLButtonElement).disabled).toBe(true);
  const input = screen.getByRole('textbox', { name: 'Nombre de Gas' });
  fireEvent.change(input, { target: { value: 'Cilindros' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.save).toHaveBeenCalledWith('products', ['Cilindros', 'Accesorios', 'Otros', 'Promociones', 'Servicios', 'Hogar']));
});
