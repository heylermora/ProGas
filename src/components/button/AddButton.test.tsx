import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import AddButton from './AddButton';

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

describe('AddButton component', () => {
  it('renders an accessible add button and navigates to the provided redirect', async () => {
    render(
      <MemoryRouter initialEntries={['/orders']}>
        <AddButton redirect="/orders/new" />
        <CurrentPath />
      </MemoryRouter>
    );

    expect(screen.getByTestId('current-path').textContent).toBe('/orders');

    await userEvent.click(screen.getByRole('button', { name: /custom button/i }));

    expect(screen.getByTestId('current-path').textContent).toBe('/orders/new');
  });
});
