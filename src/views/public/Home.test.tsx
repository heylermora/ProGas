import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import theme from 'theme/theme';

jest.mock('./SponsorStrip', () => ({
  __esModule: true,
  default: ({ type, offset = 0 }: { type: string; offset?: number }) => (
    <section data-testid="sponsor-strip">{`${type}-${offset}`}</section>
  ),
}));

const renderHome = () => render(
  <ChakraProvider theme={theme}>
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  </ChakraProvider>
);

describe('Home', () => {
  it('renders the main conversion copy and customer actions', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: /pedí tu gas en minutos/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /hacer pedido/i }).getAttribute('href')).toBe('/customer/data');
    expect(screen.getByRole('link', { name: /ver pedido/i }).getAttribute('href')).toBe('/customer/view-order');
    expect(screen.getAllByTestId('sponsor-strip')).toHaveLength(2);
  });

  it('keeps social links hidden until the responsive logo hub is opened', () => {
    renderHome();

    const toggle = screen.getByRole('button', { name: /mostrar redes sociales de gas memo/i });
    const facebook = screen.getByRole('link', { name: 'Facebook', hidden: true });

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(window.getComputedStyle(facebook).visibility).toBe('hidden');
    expect(window.getComputedStyle(facebook).opacity).toBe('0');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /ocultar redes sociales de gas memo/i }).getAttribute('aria-expanded')).toBe('true');
    expect(window.getComputedStyle(facebook).visibility).toBe('visible');
    expect(window.getComputedStyle(facebook).opacity).toBe('1');
  });

  it('emits responsive Chakra styles for mobile-first layout and desktop breakpoints', () => {
    renderHome();

    const styles = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent || '')
      .join('\n');

    expect(styles).toContain('@media screen and (min-width: 48em)');
    expect(styles).toContain('@media screen and (min-width: 62em)');
    expect(screen.getByRole('button', { name: /mostrar redes sociales de gas memo/i })).toBeTruthy();
  });
});
