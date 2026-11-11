import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MallPreview from './MallPreview';
import SponsorService from 'services/SponsorService';

jest.mock('services/SponsorService', () => ({ __esModule: true, default: { getAll: jest.fn() } }));

beforeEach(() => {
  (SponsorService.getAll as jest.Mock).mockResolvedValue(Array.from({ length: 6 }, (_, index) => ({
    id: String(index), name: `Comercio ${index}`, category: 'Otros', active: true, order: index, logoUrl: '', links: ['https://example.com'],
  })));
});

const showCarousel = async () => {
  render(<ChakraProvider><MemoryRouter><MallPreview embedded /></MemoryRouter></ChakraProvider>);
  await screen.findByRole('region', { name: 'Carrusel de negocios' });
};
const visibleNames = () => screen.getAllByRole('button', { name: /Ver contactos de Comercio/ }).map(button => button.getAttribute('aria-label'));

it('keeps the catalogue in one continuous track without paging or a control bar', async () => {
  await showCarousel();
  expect(visibleNames()).toHaveLength(6);
  expect(screen.queryByRole('button', { name: 'Pausar carrusel' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Negocios siguientes' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Negocios anteriores' })).toBeNull();
});

it('opens and closes the selected contact without duplicating accessible businesses', async () => {
  await showCarousel();
  fireEvent.click(screen.getAllByRole('button', { name: /Ver contactos de Comercio/ })[0]);
  expect(await screen.findByRole('group', { name: /Redes sociales de Comercio/ })).toBeTruthy();
  const selected = screen.getByRole('button', { name: /Ocultar contactos de Comercio/ });
  expect(selected.getAttribute('aria-expanded')).toBe('true');
  expect(visibleNames()).toHaveLength(5);
  fireEvent.click(selected);
  expect(screen.queryByRole('group', { name: /Redes sociales de Comercio/ })).toBeNull();
  expect(visibleNames()).toHaveLength(6);
});
