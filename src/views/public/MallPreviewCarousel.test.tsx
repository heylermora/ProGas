import { ChakraProvider } from '@chakra-ui/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MallPreview from './MallPreview';
import SponsorService from 'services/SponsorService';

jest.mock('services/SponsorService', () => ({ __esModule: true, default: { getAll: jest.fn() } }));

beforeEach(() => {
  jest.useFakeTimers();
  (SponsorService.getAll as jest.Mock).mockResolvedValue(Array.from({ length: 6 }, (_, index) => ({
    id: String(index), name: `Comercio ${index}`, category: 'Otros', active: true, order: index, logoUrl: '', links: ['https://example.com'],
  })));
});
afterEach(() => jest.useRealTimers());

const showCarousel = async () => {
  render(<ChakraProvider><MemoryRouter><MallPreview embedded /></MemoryRouter></ChakraProvider>);
  await screen.findByRole('region', { name: 'Carrusel de negocios' });
};
const visibleNames = () => screen.getAllByRole('button', { name: /Ver contactos de Comercio/ }).map(button => button.getAttribute('aria-label'));

it('shows exactly three businesses, rotates automatically and allows pausing and resuming', async () => {
  await showCarousel();
  const first = visibleNames();
  expect(first).toHaveLength(3);
  act(() => jest.advanceTimersByTime(6000));
  const second = visibleNames();
  expect(second).toHaveLength(3);
  expect(second).not.toEqual(first);
  fireEvent.click(screen.getByRole('button', { name: 'Pausar carrusel' }));
  act(() => jest.advanceTimersByTime(12000));
  expect(visibleNames()).toEqual(second);
  fireEvent.click(screen.getByRole('button', { name: 'Reanudar carrusel' }));
  act(() => jest.advanceTimersByTime(6000));
  expect(visibleNames()).toEqual(first);
});

it('pauses on an open contact and changes groups with the controls', async () => {
  await showCarousel();
  const first = visibleNames();
  fireEvent.click(screen.getAllByRole('button', { name: /Ver contactos de Comercio/ })[0]);
  expect(await screen.findByRole('group', { name: /Redes sociales de Comercio/ })).toBeTruthy();
  act(() => jest.advanceTimersByTime(12000));
  expect(screen.getByRole('button', { name: /Ocultar contactos de Comercio/ })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Negocios siguientes' }));
  expect(screen.queryByRole('group', { name: /Redes sociales de Comercio/ })).toBeNull();
  expect(visibleNames()).not.toEqual(first);
  fireEvent.click(screen.getByRole('button', { name: 'Negocios anteriores' }));
  expect(visibleNames()).toEqual(first);
});
