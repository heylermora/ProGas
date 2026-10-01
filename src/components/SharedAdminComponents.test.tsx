import { ChakraProvider, Input } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import FilterPanel from './dataDisplay/FilterPanel';
import StatusBadge from './dataDisplay/StatusBadge';
import ActiveSwitch from './form/ActiveSwitch';
import FormActions from './form/FormActions';
import FormField from './form/FormField';
import BackButton from './button/BackButton';

const renderUi = (ui: React.ReactNode) => render(<ChakraProvider>{ui}</ChakraProvider>);

describe('shared admin components', () => {
  it('exposes filter count and clears active filters', () => {
    const clear = jest.fn();
    renderUi(<FilterPanel title="Filtros" activeCount={2} onClear={clear}><div>Campos</div></FilterPanel>);
    fireEvent.click(screen.getByRole('button', { name: /limpiar filtros \(2\)/i }));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('associates labels and help with arbitrary form controls', () => {
    renderUi(<FormField id="customer" label="Cliente" help="Nombre completo"><Input id="customer" /></FormField>);
    expect(screen.getByLabelText('Cliente')).toBeTruthy();
    expect(screen.getByText('Nombre completo')).toBeTruthy();
  });

  it('normalizes active state and form actions', () => {
    const change = jest.fn(); const save = jest.fn(); const cancel = jest.fn();
    renderUi(<><StatusBadge active={false} /><ActiveSwitch id="active" label="Acceso activo" isChecked={false} onChange={change} /><FormActions onCancel={cancel} onSubmit={save} submitLabel="Guardar" /></>);
    expect(screen.getByText('Inactivo')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Acceso activo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(change).toHaveBeenCalledWith(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('uses the shared back action', () => {
    const goBack = jest.fn();
    renderUi(<BackButton onClick={goBack}>Volver al inventario</BackButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Volver al inventario' }));
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
