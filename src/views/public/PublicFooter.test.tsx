import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicFooter from './PublicFooter';
import packageInfo from '../../../package.json';

describe('PublicFooter', () => {
  it('presents product information, creator portfolio and subtle admin access', () => {
    render(
      <ChakraProvider>
        <MemoryRouter>
          <PublicFooter />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.getByText(`Versión ${packageInfo.version}`)).toBeTruthy();
    expect(screen.getByRole('link', { name: /ver portafolio profesional/i }).getAttribute('href')).toBe('/portfolio');
    expect(screen.getByRole('link', { name: /acceso administrativo/i }).getAttribute('href')).toBe('/auth/sign-in');
    expect(screen.getByText(/emprendimiento necesita una presencia digital/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /explorar comercios/i })).toBeNull();
  });

  it('does not duplicate the primary order action on the home page', () => {
    render(
      <ChakraProvider>
        <MemoryRouter initialEntries={['/']}>
          <PublicFooter />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.queryByRole('link', { name: /hacer pedido/i })).toBeNull();
  });
});
