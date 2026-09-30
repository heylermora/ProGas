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
    expect(screen.getByRole('heading', { name: /soluciones pensadas para personas reales/i })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Gas Memo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Centro Comercial Virtual' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'ProGest' })).toBeTruthy();
    expect(screen.getByText(/menos pasos para pedir/i)).toBeTruthy();
    expect(screen.getByText(/mayor visibilidad para emprendimientos/i)).toBeTruthy();
    expect(screen.getByText(/operación más ordenada/i)).toBeTruthy();
    expect(screen.queryByText(/ver código/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /github/i })).toBeNull();
    expect(screen.getByRole('link', { name: /quiero una solución similar/i }).getAttribute('href')).toContain('wa.me/50683508585');
  });
});
