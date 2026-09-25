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
    const whatsapp = screen.getByRole('link', { name: /conversemos por whatsapp/i });
    expect(whatsapp.getAttribute('href')).toContain('wa.me/50683508585');
    expect(whatsapp.getAttribute('href')).toContain('Gas%20Memo');
    expect(screen.getByRole('link', { name: /ver proyecto en acción/i }).getAttribute('href')).toBe('/mall');
  });
});
