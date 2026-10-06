import { ChakraProvider, Input, InputGroup, InputLeftAddon, Select } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import Form from './Form';
import FormField from './FormField';

const renderUi = (ui: React.ReactNode) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('unified forms', () => {
  it('validates required fields when submitted through the keyboard and accepts numeric values', () => {
    const submit = jest.fn();
    renderUi(<Form title="Pedido" button="Guardar" fields={[
      { name: 'name', label: 'Nombre', type: 'text', value: '', validation: { required: true } },
      { name: 'quantity', label: 'Cantidad', type: 'number', value: 2, validation: { required: true } },
    ]} onSubmit={submit} />);
    fireEvent.submit(screen.getByRole('form', { name: 'Pedido' }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText('El campo es requerido.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Ana' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Pedido' }));
    expect(submit).toHaveBeenCalledWith({ name: 'Ana', quantity: 2 });
  });

  it('associates labels with selects and readonly inputs inside groups', () => {
    renderUi(<><FormField label="Categoría"><Select value="Gas" onChange={jest.fn()}><option>Gas</option></Select></FormField>
      <FormField label="Precio"><InputGroup><InputLeftAddon>₡</InputLeftAddon><Input isReadOnly value="500" /></InputGroup></FormField></>);
    expect(screen.getByLabelText('Categoría').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Precio').tagName).toBe('INPUT');
  });

  it('keeps one back action above the fields and blocks submission during saving', () => {
    const back = jest.fn(); const submit = jest.fn();
    renderUi(<Form title="Editar" onBack={back} submitLabel="Guardar" isSubmitting onFormSubmit={submit}><Input aria-label="Nombre" /></Form>);
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(back).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    fireEvent.submit(screen.getByRole('form', { name: 'Editar' }));
    expect(submit).not.toHaveBeenCalled();
  });

  it('does not inject a back button into modal forms', () => {
    renderUi(<Form onFormSubmit={jest.fn()}><Input aria-label="Monto" /></Form>);
    expect(screen.queryByRole('button', { name: 'Volver' })).toBeNull();
  });
});
