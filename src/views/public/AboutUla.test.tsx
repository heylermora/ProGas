import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import AboutUla from './AboutUla';

it('explains Ulà and links to the public directory, promotion form and source', () => {
  render(<ChakraProvider><MemoryRouter initialEntries={['/que-es-ula']}>
    <Route exact path="/que-es-ula" component={AboutUla} />
  </MemoryRouter></ChakraProvider>);

  expect(screen.getByRole('heading', { level: 1, name: 'Qué es Ulà' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Explorar comercios' }).getAttribute('href')).toBe('/mall');
  expect(screen.getByRole('link', { name: 'Quiero promocionar mi negocio' }).getAttribute('href')).toBe('/promocionar-negocio');
  expect(screen.getByRole('link', { name: /leer sobre ulàpeitök/i }).getAttribute('href')).toContain('ucr.ac.cr');
  expect(screen.getByRole('img', { name: /ilustración de la iglesia/i }).getAttribute('src')).toMatch(/ula\/acosta\.webp$/);
  const gallery = within(screen.getByRole('region', { name: 'Paisajes de Acosta' }));
  expect(gallery.getAllByRole('img')).toHaveLength(4);
  expect(gallery.getByRole('img', { name: /san ignacio de acosta/i })).toBeTruthy();
  expect(gallery.getByRole('link', { name: 'Rodtico21' })).toBeTruthy();
});
