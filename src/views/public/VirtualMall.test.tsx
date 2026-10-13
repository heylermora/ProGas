import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import VirtualMall from './VirtualMall';

jest.mock('services/SponsorService', () => ({ __esModule: true, default: { getAll: jest.fn() } }));
jest.mock('hooks/useCategories', () => ({ __esModule: true, default: () => ({ categories: ['Restaurantes/Sodas'] }) }));
jest.mock('./PublicPage', () => ({ PublicPage: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

const renderMall = () => render(<ChakraProvider><MemoryRouter><VirtualMall /></MemoryRouter></ChakraProvider>);

describe('VirtualMall flight navigation', () => {
  it.each([1, 3, 8])('paginates %i businesses in groups of at most eight and returns to the main map', async (count) => {
    (SponsorService.getAll as jest.Mock).mockResolvedValue(Array.from({ length: count }, (_, i) => ({
      id: String(i), name: `Negocio ${i + 1}`, category: 'Restaurantes/Sodas', active: true, order: i, logoUrl: '', links: [],
    })));
    renderMall();
    fireEvent.click(await screen.findByRole('button', { name: `Entrar a Restaurantes/Sodas, ${count} negocios` }));
    expect(screen.getAllByRole('button', { name: /Abrir ficha de/ })).toHaveLength(Math.min(count, 8));
    const next = screen.getByRole('button', { name: 'Ruta: siguiente' });
    expect((next as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Volver al mapa principal' }));
    expect(screen.getByRole('button', { name: `Entrar a Restaurantes/Sodas, ${count} negocios` })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Abrir ficha de/ })).toBeNull();
  });
  it('navigates a ninth business on its own route without dropping any businesses', async () => {
    (SponsorService.getAll as jest.Mock).mockResolvedValue(Array.from({ length: 9 }, (_, i) => ({
      id: String(i), name: `Negocio ${i + 1}`, category: 'Restaurantes/Sodas', active: true, order: i, logoUrl: '', links: [],
    })));
    renderMall();
    fireEvent.click(await screen.findByRole('button', { name: 'Entrar a Restaurantes/Sodas, 9 negocios' }));
    expect(screen.getAllByRole('button', { name: /Abrir ficha de/ })).toHaveLength(8);
    fireEvent.click(screen.getByRole('button', { name: 'Ruta: siguiente' }));
    expect(screen.getAllByRole('button', { name: /Abrir ficha de/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Abrir ficha de Negocio 9' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ruta: anterior' }));
    expect(screen.getAllByRole('button', { name: /Abrir ficha de/ })).toHaveLength(8);
  });

});
