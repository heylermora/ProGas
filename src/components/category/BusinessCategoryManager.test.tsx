import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CategoryService from 'services/CategoryService';
import BusinessCategoryManager from './BusinessCategoryManager';

jest.mock('services/CategoryService', () => ({ __esModule: true, default: { getBusinessSettings: jest.fn(), saveBusinessSettings: jest.fn() } }));
it('creates a specific category with an editable icon and persists its parent', async () => {
  (CategoryService.getBusinessSettings as jest.Mock).mockResolvedValue({ groups: [{ name: 'Comida', icon: '🍽️', categories: ['Sodas'] }], icons: { Sodas: '🍲' } });
  (CategoryService.saveBusinessSettings as jest.Mock).mockResolvedValue(undefined);
  const onSaved = jest.fn();
  render(<ChakraProvider><BusinessCategoryManager categories={['Sodas']} isOpen onClose={jest.fn()} onSaved={onSaved} /></ChakraProvider>);
  fireEvent.change(await screen.findByLabelText('Nivel'), { target: { value: 'specific' } });
  fireEvent.change(screen.getByLabelText('Nueva categoría'), { target: { value: 'Panaderías' } });
  fireEvent.change(screen.getByLabelText('Ícono de la nueva categoría'), { target: { value: '🥐' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar categoría' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(CategoryService.saveBusinessSettings).toHaveBeenCalledWith(['Sodas', 'Panaderías'], { groups: [{ name: 'Comida', icon: '🍽️', categories: ['Sodas', 'Panaderías'] }], icons: { Sodas: '🍲', Panaderías: '🥐' } }));
  expect(onSaved).toHaveBeenCalled();
});
