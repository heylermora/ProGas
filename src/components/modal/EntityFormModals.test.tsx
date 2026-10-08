import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import ClientService from 'services/ClientService';
import UserService from 'services/UserService';
import Clients from 'views/admin/client';
import Users from 'views/admin/user';

jest.mock('contexts/PageSearchContext', () => ({ usePageSearch: () => ({ query: '' }) }));
jest.mock('services/ClientService', () => ({ __esModule: true, default: { getAll: jest.fn(), create: jest.fn(), edit: jest.fn() } }));
jest.mock('services/UserService', () => ({ __esModule: true, CollaboratorRollbackError: class extends Error {}, default: { getAll: jest.fn(), createCollaborator: jest.fn(), updateCollaborator: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  (ClientService.getAll as jest.Mock).mockResolvedValue([]);
  (UserService.getAll as jest.Mock).mockResolvedValue([]);
});

describe('client and collaborator form modals', () => {
  it('creates clients through a modal and retains fields after a failed save', async () => {
    (ClientService.create as jest.Mock).mockRejectedValue(new Error('Connection failed'));
    render(<ChakraProvider><Clients /></ChakraProvider>);
    await screen.findByText('Aún no hay clientes');
    fireEvent.click(screen.getAllByRole('button', { name: 'Nuevo cliente' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Registrar cliente' });
    const ui = within(dialog);
    fireEvent.change(ui.getByRole('textbox', { name: /Cédula/ }), { target: { value: '101110111' } });
    fireEvent.change(ui.getByRole('textbox', { name: /Nombre completo/ }), { target: { value: 'Cliente de prueba' } });
    fireEvent.change(ui.getByRole('textbox', { name: /Teléfono/ }), { target: { value: '88888888' } });
    fireEvent.submit(dialog);
    await waitFor(() => expect(ClientService.create).toHaveBeenCalledTimes(1));
    await screen.findByText('No se pudo guardar el cliente');
    expect((ui.getByRole('textbox', { name: /Nombre completo/ }) as HTMLInputElement).value).toBe('Cliente de prueba');
    expect(ui.queryByRole('button', { name: 'Volver' })).toBeNull();
  });

  it('focuses the first invalid required field instead of saving', async () => {
    render(<ChakraProvider><Clients /></ChakraProvider>);
    await screen.findByText('Aún no hay clientes');
    fireEvent.click(screen.getAllByRole('button', { name: 'Nuevo cliente' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Registrar cliente' });
    fireEvent.submit(dialog);
    expect(ClientService.create).not.toHaveBeenCalled();
    await waitFor(() => expect(within(dialog).getByRole('textbox', { name: /Nombre completo/ }).matches(':focus')).toBe(true));
  });

  it('opens collaborator creation in the same modal pattern', async () => {
    render(<ChakraProvider><Users /></ChakraProvider>);
    await screen.findByText('Aún no hay colaboradores');
    fireEvent.click(screen.getAllByRole('button', { name: 'Agregar colaborador' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Nuevo colaborador' });
    expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toBeTruthy();
    expect(within(dialog).getByLabelText(/Contraseña temporal/)).toBeTruthy();
    await waitFor(() => expect(UserService.getAll).toHaveBeenCalled());
  });
});
