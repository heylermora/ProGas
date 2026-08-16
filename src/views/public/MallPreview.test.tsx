import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type SponsorItem from 'interfaces/SponsorItem';
import SponsorService from 'services/SponsorService';
import MallPreview from './MallPreview';

jest.mock('services/SponsorService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
  },
}));

const businesses: SponsorItem[] = [
  { id: '1', name: 'Café Central', category: 'Cafeterías', active: true, order: 1, logoUrl: '', links: [] },
  { id: '2', name: 'Tienda Local', category: 'Tiendas', active: true, order: 2, logoUrl: '', links: [] },
  { id: '3', name: 'Negocio oculto', category: 'Otros', active: false, order: 3, logoUrl: '', links: [] },
];

const renderPreview = () => render(
  <ChakraProvider>
    <MemoryRouter>
      <MallPreview />
    </MemoryRouter>
  </ChakraProvider>
);

describe('MallPreview', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: () => undefined,
    });
  });

  beforeEach(() => {
    (SponsorService.getAll as jest.Mock).mockResolvedValue(businesses);
  });

  it('shows active businesses, supports categories and links to the mall', async () => {
    renderPreview();

    expect(await screen.findByText('Café Central')).toBeTruthy();
    expect(screen.getByText('Tienda Local')).toBeTruthy();
    expect(screen.queryByText('Negocio oculto')).toBeNull();
    expect(screen.getByRole('link', { name: /explorar el mapa/i }).getAttribute('href')).toBe('/mall');
    expect(screen.getByRole('link', { name: /ver estación de café central/i }).getAttribute('href')).toBe('/mall?business=1');

    fireEvent.click(screen.getByRole('button', { name: 'Cafeterías' }));

    expect(screen.getByText('Café Central')).toBeTruthy();
    expect(screen.queryByText('Tienda Local')).toBeNull();
  });
});
