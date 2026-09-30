import { ChakraProvider, Button } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MdPeople } from 'react-icons/md';
import PageHeader from './PageHeader';
import FormPanel from 'components/form/FormPanel';
import EmptyState from 'components/dataDisplay/EmptyState';

describe('shared page patterns', () => {
  it('renders a consistent page heading and action', () => {
    render(<ChakraProvider><PageHeader title="Clientes" description="Administrá tus clientes." action={<Button>Nuevo cliente</Button>} /></ChakraProvider>);

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeInTheDocument();
    expect(screen.getByText('Administrá tus clientes.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo cliente' })).toBeInTheDocument();
  });

  it('keeps form close and empty-state actions accessible', () => {
    const close = jest.fn();
    const create = jest.fn();
    render(
      <ChakraProvider>
        <FormPanel title="Registrar cliente" onClose={close}><div>Formulario</div></FormPanel>
        <EmptyState icon={MdPeople} title="Aún no hay clientes" description="Creá el primero." actionLabel="Nuevo cliente" onAction={create} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo cliente' }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
