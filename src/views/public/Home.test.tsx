import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import theme from 'theme/theme';

jest.mock('./MallPreview', () => ({
  __esModule: true,
  default: () => (
    <section data-testid="mall-preview">Vista de negocios</section>
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
  it('prioritizes local businesses and clearly announces future online orders', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /lo que busca, en acosta/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^ver negocios$/i }).getAttribute('href')).toBe('/mall');
    expect(screen.getByText('PRÓXIMAMENTE')).toBeTruthy();
    expect(screen.getByText(/este servicio aún no está disponible/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /hacer pedido/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /ver pedido/i })).toBeNull();
    const community = screen.getByRole('region', { name: /lo que busca, en acosta/i });
    expect(within(community).getByTestId('mall-preview')).toBeTruthy();
    expect(screen.queryByText('Cerca de usted. Parte de Acosta.')).toBeNull();
  });

  it('always shows social links for Gas Memo and the band without a toggle', () => {
    renderHome();
    const gas = within(screen.getByRole('group', { name: 'Redes sociales de Gas Memo' }));
    const band = within(screen.getByRole('group', { name: 'Redes sociales de Banda Municipal de Acosta' }));
    expect(gas.getByRole('link', { name: 'Facebook' }).getAttribute('href')).toContain('facebook.com/gasmemoymandaditos');
    for (const name of ['Facebook', 'Instagram', 'WhatsApp', 'TikTok', 'Correo']) {
      expect(gas.getByRole('link', { name }).style.visibility).not.toBe('hidden');
    }
    const bandUrls = {
      Facebook: 'https://www.facebook.com/BandaMunicipaldeAcosta/',
      Instagram: 'https://www.instagram.com/bandamunicipaldeacosta',
      TikTok: 'https://www.tiktok.com/@bandamunicipaldeacosta',
      WhatsApp: 'https://wa.me/50662787984',
    };
    Object.entries(bandUrls).forEach(([name, href]) => {
      expect(band.getByRole('link', { name }).getAttribute('href')).toBe(href);
    });
    expect(screen.getByRole('link', { name: /haga un aporte/i }).getAttribute('href')).toContain('phone=50662787984');
    expect(screen.getByText('6278-7984')).toBeTruthy();
    expect(screen.queryByText('Seleccione el logo para ver las redes.')).toBeNull();
    expect(screen.queryByRole('button', { name: /mostrar redes sociales/i })).toBeNull();
  });

  it('keeps community navigation available on mobile and desktop viewport widths', () => {
    const { unmount } = renderHome();

    setViewportWidth(375);
    expect(screen.getByRole('link', { name: /^ver negocios$/i }).getAttribute('href')).toBe('/mall');
    expect(screen.queryByRole('link', { name: /ver pedido/i })).toBeNull();

    unmount();
    setViewportWidth(1280);
    renderHome();

    expect(screen.getByRole('heading', { name: /lo que busca, en acosta/i })).toBeTruthy();
    expect(screen.getByTestId('mall-preview')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Redes sociales de Gas Memo' })).toBeTruthy();
  });
});
