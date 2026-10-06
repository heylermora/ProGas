import React, { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import SearchableCategorySelect from './SearchableCategorySelect';

const categories = ['Cafeterías', 'Pizzerías', 'Farmacias'];

it('searches without accents, selects with the keyboard and clears the category', () => {
  const changed = jest.fn();
  function Example() {
    const [value, setValue] = useState('');
    return <ChakraProvider><SearchableCategorySelect categories={categories} value={value} onChange={(category) => {
      setValue(category);
      changed(category);
    }} /></ChakraProvider>;
  }
  render(<Example />);
  const input = screen.getByLabelText('Categoría');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'cafe' } });
  expect(screen.getByText('Cafeterías')).toBeTruthy();
  expect(screen.queryByText('Pizzerías')).toBeNull();
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  expect(changed).toHaveBeenLastCalledWith('Cafeterías');
  fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
  expect(changed).toHaveBeenLastCalledWith('');
  expect(screen.getByText('Todas las categorías')).toBeTruthy();
});

it('explains when no category matches the search', () => {
  render(<ChakraProvider><SearchableCategorySelect categories={categories} value="" onChange={jest.fn()} /></ChakraProvider>);
  const input = screen.getByLabelText('Categoría');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'inexistente' } });
  expect(screen.getByText('No encontramos esa categoría.')).toBeTruthy();
});
