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

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event('resize'));
};

describe('Home', () => {
  it('renders the main conversion copy and customer actions', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: /pedí tu gas en minutos/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /hacer pedido/i }).getAttribute('href')).toBe('/customer/data');
    expect(screen.getByRole('link', { name: /ver pedido/i }).getAttribute('href')).toBe('/customer/view-order');
    expect(screen.getAllByTestId('sponsor-strip')).toHaveLength(2);
  });

  it('opens and closes the social logo hub with accessible state', () => {
    renderHome();

    const toggle = screen.getByRole('button', { name: /mostrar redes sociales de gas memo/i });
    const facebook = screen.getByLabelText('Facebook');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(facebook.getAttribute('href')).toContain('facebook.com/gasmemoymandaditos');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /ocultar redes sociales de gas memo/i }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByLabelText('Facebook').getAttribute('href')).toContain('facebook.com/gasmemoymandaditos');
  });

  it('keeps the main actions available on mobile and desktop viewport widths', () => {
    const { unmount } = renderHome();

    setViewportWidth(375);
    expect(screen.getByRole('link', { name: /hacer pedido/i }).getAttribute('href')).toBe('/customer/data');
    expect(screen.getByRole('link', { name: /ver pedido/i }).getAttribute('href')).toBe('/customer/view-order');

    unmount();
    setViewportWidth(1280);
    renderHome();

    expect(screen.getByRole('heading', { name: /pedí tu gas en minutos/i })).toBeTruthy();
    expect(screen.getAllByTestId('sponsor-strip')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /mostrar redes sociales de gas memo/i })).toBeTruthy();
  });
});
