import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import SponsorForm from './form';

jest.mock('hooks/useCategories', () => ({ __esModule: true, default: () => ({ categories: ['Otros', 'Tiendas'] }) }));
jest.mock('services/SponsorService', () => ({ __esModule: true, default: { create: jest.fn(), edit: jest.fn(), get: jest.fn(), nextOrder: jest.fn() } }));

const showForm = (path = '/admin/sponsor/new') => render(<ChakraProvider><MemoryRouter initialEntries={[path]}>
  <Route path="/admin/sponsor/new" component={SponsorForm} /><Route path="/admin/sponsor/edit/:id" component={SponsorForm} />
</MemoryRouter></ChakraProvider>);

beforeEach(() => jest.clearAllMocks());

it('creates a sponsor with optional networks empty and saves location and directions', async () => {
  showForm();
  fireEvent.change(screen.getByLabelText('Nombre del negocio'), { target: { value: 'Negocio prueba' } });
  fireEvent.change(screen.getByLabelText('Señas del negocio'), { target: { value: 'Frente al parque' } });
  expect(screen.queryByLabelText('Posición dentro de la categoría')).toBeNull();
  expect(screen.queryByLabelText('Coordenadas del negocio')).toBeNull();
  fireEvent.change(screen.getByLabelText('Enlace de Google Maps'), { target: { value: 'https://maps.app.goo.gl/local123' } });
  fireEvent.change(screen.getByLabelText('Enlace de Waze'), { target: { value: 'https://waze.com/ul?ll=9.798%2C-84.162' } });
  expect(screen.getByRole('link', { name: 'Waze' }).getAttribute('href')).toContain('ll=9.798%2C-84.162');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar patrocinador' }));
  await waitFor(() => expect(SponsorService.create).toHaveBeenCalledWith(expect.objectContaining({ links: [], mapsUrl: 'https://maps.app.goo.gl/local123', directions: 'Frente al parque' })));
});

it('rejects a link from a different network and preserves fields after a failed save', async () => {
  (SponsorService.create as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  showForm();
  const facebook = screen.getByLabelText('Facebook');
  fireEvent.change(facebook, { target: { value: 'https://instagram.com/local' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar patrocinador' }));
  expect(await screen.findByText(/Ingrese el enlace completo de Facebook/)).toBeTruthy();
  expect(SponsorService.create).not.toHaveBeenCalled();
  fireEvent.change(facebook, { target: { value: 'https://facebook.com/local' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar patrocinador' }));
  expect(await screen.findByText(/Sus cambios se conservan/)).toBeTruthy();
  expect((facebook as HTMLInputElement).value).toBe('https://facebook.com/local');
});

it.each(['data:video/mp4;base64,AAA', '<iframe src="https://www.facebook.com/plugins/video.php?href=legacy"></iframe>'])('edits historic contacts without losing extra links or an existing video: %s', async videoUrl => {
  (SponsorService.get as jest.Mock).mockResolvedValue({ id: 'one', name: 'Local', category: 'Otros', active: true, order: 2, logoUrl: '', videoUrl, links: ['https://facebook.com/local', 'https://example.com', 'https://example.org'] });
  showForm('/admin/sponsor/edit/one');
  const facebook = await screen.findByLabelText('Facebook');
  expect((facebook as HTMLInputElement).value).toBe('https://facebook.com/local');
  fireEvent.change(facebook, { target: { value: 'https://facebook.com/new-local' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar patrocinador' }));
  await waitFor(() => expect(SponsorService.edit).toHaveBeenCalledWith('one', expect.objectContaining({ videoUrl, order: 2, links: ['https://facebook.com/new-local', 'https://example.com', 'https://example.org'] })));
});

it('reveals the video error when an unsupported link is in the collapsed section', async () => {
  showForm();
  const videoSection = screen.getByRole('button', { name: /Video promocional/ });
  fireEvent.click(videoSection);
  fireEvent.change(screen.getByLabelText('Enlace del video'), { target: { value: 'https://drive.google.com/file/d/123' } });
  fireEvent.click(videoSection);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar patrocinador' }));
  expect(await screen.findByText('Use un enlace de YouTube, Vimeo o un archivo público MP4, WebM u OGG.')).toBeTruthy();
  await waitFor(() => expect(videoSection.getAttribute('aria-expanded')).toBe('true'));
  expect(SponsorService.create).not.toHaveBeenCalled();
});

it('moves an edited sponsor to the end only when its category changes', async () => {
  (SponsorService.get as jest.Mock).mockResolvedValue({ id: 'one', name: 'Local', category: 'Otros', active: true, order: 2, logoUrl: '', links: [] });
  (SponsorService.nextOrder as jest.Mock).mockResolvedValue(7);
  showForm('/admin/sponsor/edit/one');
  const category = await screen.findByLabelText('Categoría');
  fireEvent.change(category, { target: { value: 'Tiendas' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar patrocinador' }));
  await waitFor(() => expect(SponsorService.edit).toHaveBeenCalledWith('one', expect.objectContaining({ category: 'Tiendas', order: 7 })));
  expect(SponsorService.nextOrder).toHaveBeenCalledWith('Tiendas');
});
