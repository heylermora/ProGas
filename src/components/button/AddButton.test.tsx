import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddButton from './AddButton';

describe('Test AddButton component', () => {
  it('renders the button with the provided redirect', () => {
    const redirect = '/example-path';
    const { getByLabelText } = render(
      <MemoryRouter>
        <AddButton redirect={redirect} />
      </MemoryRouter>
    );

    const button = screen.getByLabelText('Custom Button');
    fireEvent.click(button);

    expect(button).toBeTruthy();
  });
});