import { Button, ChakraProvider, Input } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FormField from 'components/form/FormField';
import { useState } from 'react';
import DeleteModal from './DeleteModal';
import FormModal from './FormModal';
import ModalList from './ModalList';

const renderUi = (ui: React.ReactNode) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('shared modal patterns', () => {
  it('submits a semantic form, with close and cancel actions and no back button', () => {
    const save = jest.fn(); const close = jest.fn();
    renderUi(<FormModal title="Registrar cliente" isOpen onClose={close} onSubmit={save} submitLabel="Guardar">
      <FormField label="Nombre"><Input /></FormField>
    </FormModal>);
    const dialog = screen.getByRole('dialog', { name: 'Registrar cliente' });
    expect(dialog.tagName).toBe('FORM');
    fireEvent.submit(dialog);
    expect(save).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Volver' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('blocks duplicate submissions and closing while saving', () => {
    const save = jest.fn(); const close = jest.fn();
    renderUi(<FormModal title="Guardar" isOpen onClose={close} onSubmit={save} submitLabel="Guardar" isSubmitting><Input aria-label="Nombre" /></FormModal>);
    fireEvent.submit(screen.getByRole('dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(save).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect((screen.getByRole('button', { name: 'Cancelar' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('returns focus to the launcher after closing', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return <><Button onClick={() => setOpen(true)}>Nuevo cliente</Button><FormModal title="Cliente" isOpen={open} onClose={() => setOpen(false)} onSubmit={jest.fn()} submitLabel="Guardar"><Input aria-label="Nombre" /></FormModal></>;
    }
    renderUi(<Example />);
    const launcher = screen.getByRole('button', { name: 'Nuevo cliente' });
    launcher.focus(); fireEvent.click(launcher);
    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(launcher.matches(':focus')).toBe(true));
  });

  it('focuses cancel in destructive confirmations', async () => {
    renderUi(<DeleteModal title="Eliminar" message="No se puede deshacer" isOpen onClose={jest.fn()} handle={jest.fn()} />);
    expect(screen.getByRole('alertdialog', { name: 'Eliminar' })).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancelar' }).matches(':focus')).toBe(true));
  });

  it('bounds category lists with pagination while retaining original indexes', () => {
    const items = ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis'];
    const select = jest.fn();
    renderUi(<ModalList items={items} renderItem={(item, index) => <Button onClick={() => select(index)}>{item}</Button>} />);
    expect(screen.queryByRole('button', { name: 'Seis' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Seis' }));
    expect(select).toHaveBeenCalledWith(5);
  });
});
