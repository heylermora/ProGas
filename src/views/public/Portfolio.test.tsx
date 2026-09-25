import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Portfolio from './Portfolio';

describe('Portfolio', () => {
  it('offers local digital services and a contact action', () => {
    render(<ChakraProvider><MemoryRouter><Portfolio /></MemoryRouter></ChakraProvider>);

    expect(screen.getByRole('heading', { name: 'Johel Mora' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /solución clara para hacer crecer/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /conversemos sobre tu idea/i }).getAttribute('href')).toContain('mailto:johelmora@gmail.com');
  });
});
