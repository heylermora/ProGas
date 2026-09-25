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
  { id: '1', name: 'Café Central', category: 'Cafeterías', active: true, order: 1, logoUrl: '', links: ['https://instagram.com/cafe-central', 'cafe@example.com'] },
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
      value: jest.fn(),
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
      configurable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    (SponsorService.getAll as jest.Mock).mockResolvedValue(businesses);
  });

  it('shows all active businesses without category filters and links to the mall', async () => {
    renderPreview();

    expect(await screen.findByText('Café Central')).toBeTruthy();
    expect(screen.getByText('Tienda Local')).toBeTruthy();
    expect(screen.queryByText('Negocio oculto')).toBeNull();
    expect(screen.getByRole('link', { name: /explorar todos los negocios/i }).getAttribute('href')).toBe('/mall');
    expect(screen.queryByRole('button', { name: 'Cafeterías' })).toBeNull();
    expect(screen.queryByRole('button', { name: /ver negocios anteriores/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /ver más negocios/i })).toBeNull();
  });

  it('opens contact bubbles in place and pauses the carousel', async () => {
    renderPreview();

    const business = await screen.findByRole('button', { name: /ver contactos de café central/i });
    fireEvent.click(business);

    expect(screen.getByRole('button', { name: /ocultar contactos de café central/i }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByLabelText(/instagram de café central/i).getAttribute('href')).toContain('instagram.com');
    expect(screen.getByText(/carrusel está pausado/i)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /ver estación de café central/i })).toBeNull();
  });
});
