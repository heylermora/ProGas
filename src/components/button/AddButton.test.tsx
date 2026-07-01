import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import AddButton from './AddButton';

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

describe('AddButton component', () => {
  it('renders an accessible add button and navigates to the provided redirect', () => {
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <AddButton redirect="/orders/new" />
        <CurrentPath />
      </MemoryRouter>
    );

    expect(screen.getByTestId('current-path').textContent).toBe('/orders');

    fireEvent.click(screen.getByRole('button', { name: /agregar nuevo registro/i }));

    expect(screen.getByTestId('current-path').textContent).toBe('/orders/new');
  });
});
