import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import SearchableCategorySelect from './SearchableCategorySelect';

it('uses a native category selector and preserves its selection after blur', () => {
  const onChange = jest.fn();
  const view = render(<ChakraProvider><SearchableCategorySelect categories={['Comida', 'Servicios']} value="" onChange={onChange} /></ChakraProvider>);
  const selector = screen.getByLabelText('Categoría', { selector: 'select' });
  fireEvent.change(selector, { target: { value: 'Servicios' } });
  expect(onChange).toHaveBeenCalledWith('Servicios');
  view.rerender(<ChakraProvider><SearchableCategorySelect categories={['Comida', 'Servicios']} value="Servicios" onChange={onChange} /></ChakraProvider>);
  fireEvent.blur(selector);
  expect((selector as HTMLSelectElement).value).toBe('Servicios');
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('preserves desktop search on blur and clears it after choosing a category', () => {
  const onChange = jest.fn();
  render(<ChakraProvider><SearchableCategorySelect categories={['Comida', 'Servicios']} value="" onChange={onChange} /></ChakraProvider>);
  const input = screen.getByLabelText('Categoría', { selector: 'input' }) as HTMLInputElement;
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'Serv' } });
  fireEvent.blur(input);
  expect(input.value).toBe('Serv');
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.click(screen.getByText('Servicios', { selector: 'div' }));
  expect(onChange).toHaveBeenCalledWith('Servicios');
  expect(input.value).toBe('');
});
