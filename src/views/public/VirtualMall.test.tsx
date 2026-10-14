import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import VirtualMall from './VirtualMall';
import theme from 'theme/theme';

jest.mock('services/SponsorService', () => ({ __esModule: true, default: { getAll: jest.fn() } }));
jest.mock('hooks/useCategories', () => ({ __esModule: true, default: () => ({ categories: ['Restaurantes/Sodas'] }) }));
jest.mock('./PublicPage', () => ({ PublicPage: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

const renderMall = () => render(<ChakraProvider theme={theme}><MemoryRouter><VirtualMall /></MemoryRouter></ChakraProvider>);

describe('VirtualMall flight navigation', () => {
  it('shows contacts on arrival, expands the description and restores focus and exploration when closed', async () => {
    const description = 'Información real del negocio. '.repeat(12);
    (SponsorService.getAll as jest.Mock).mockResolvedValue([{
      id: 'station', name: 'Negocio de prueba', category: 'Restaurantes/Sodas', active: true,
      logoUrl: '', links: ['https://wa.me/50688888888', 'https://www.instagram.com/test'],
      description, directions: 'Frente al parque', videoUrl: 'https://example.com/video.mp4',
    }]);
    renderMall();
    fireEvent.click(await screen.findByRole('button', { name: 'Entrar a Restaurantes/Sodas, 1 negocios' }));
    const station = screen.getByRole('button', { name: 'Abrir ficha de Negocio de prueba' });
    station.focus();
    fireEvent.click(station);
    const dialog = await screen.findByRole('dialog');
    const panel = within(dialog);
    expect(panel.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toBe('https://wa.me/50688888888');
    expect(panel.getByRole('link', { name: /Instagram/ })).toBeTruthy();
    expect(panel.getByText('Cómo llegar')).toBeTruthy();
    expect(panel.getByText(/Frente al parque/)).toBeTruthy();
    expect(panel.queryByRole('button', { name: /Abrir contactos|Mostrar redes/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ruta: siguiente' })).toBeNull();
    fireEvent.click(panel.getByRole('button', { name: 'Ver más' }));
    expect(panel.getByText(description.trim())).toBeTruthy();
    const videoButton = panel.getByRole('button', { name: 'Ver video del negocio' });
    videoButton.focus();
    fireEvent.click(videoButton);
    await waitFor(() => expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2));
    const videoDialog = screen.getByRole('dialog');
    expect(within(videoDialog).getByLabelText('Video de Negocio de prueba').getAttribute('src')).toBe('https://example.com/video.mp4');
    fireEvent.click(within(videoDialog).getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(1));
    await waitFor(() => expect(videoButton.matches(':focus')).toBe(true));
    fireEvent.click(panel.getByRole('button', { name: 'Seguir explorando' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(station.matches(':focus')).toBe(true));
    expect(screen.getByLabelText('Astronauta en Negocio de prueba')).toBeTruthy();
    expect(screen.getByText('1 / 1 EXPLORADAS')).toBeTruthy();
    fireEvent.click(station);
    await screen.findByRole('dialog');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape', keyCode: 27 });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Volver al mapa principal' })).toBeTruthy();
  }, 15000);

  it('opens a linked business without inventing unavailable contacts, location or video', async () => {
    (SponsorService.getAll as jest.Mock).mockResolvedValue([{
      id: 'linked', name: 'Negocio sin contactos', category: 'Restaurantes/Sodas', active: true, logoUrl: '', links: [],
    }]);
    render(<ChakraProvider theme={theme}><MemoryRouter initialEntries={['/mall?business=linked']}><VirtualMall /></MemoryRouter></ChakraProvider>);
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('heading', { name: 'Negocio sin contactos' })).toBeTruthy();
    expect(dialog.queryByText('CONTACTÁ AL NEGOCIO')).toBeNull();
    expect(dialog.queryByText('Cómo llegar')).toBeNull();
    expect(dialog.queryByRole('button', { name: 'Ver video del negocio' })).toBeNull();
    fireEvent.click(dialog.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Abrir ficha de Negocio sin contactos' })).toBeTruthy();
  });

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

  it('moves the astronaut to the selected station and remembers exploration during the visit', async () => {
    (SponsorService.getAll as jest.Mock).mockResolvedValue([1, 2].map((id) => ({
      id: String(id), name: `Negocio ${id}`, category: 'Restaurantes/Sodas', active: true, order: id, logoUrl: '', links: [],
    })));
    renderMall();
    fireEvent.click(await screen.findByRole('button', { name: 'Entrar a Restaurantes/Sodas, 2 negocios' }));
    expect(screen.getByLabelText('Astronauta listo para explorar')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir ficha de Negocio 1' }));
    expect(screen.getByLabelText('Astronauta en Negocio 1')).toBeTruthy();
    expect(screen.getByText('1 / 2 EXPLORADAS')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir ficha de Negocio 2' }));
    expect(screen.getByLabelText('Astronauta en Negocio 2')).toBeTruthy();
    expect(screen.getByText('2 / 2 EXPLORADAS')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Volver al mapa principal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Restaurantes/Sodas, 2 negocios' }));
    expect(screen.getByText('2 / 2 EXPLORADAS')).toBeTruthy();
  });

});
