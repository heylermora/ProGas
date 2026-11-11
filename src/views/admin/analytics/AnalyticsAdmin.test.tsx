import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import AnalyticsAdmin from './index';
import AnalyticsService from 'services/AnalyticsService';
import SponsorService from 'services/SponsorService';

jest.mock('services/SponsorService', () => ({ __esModule: true, default: { getAll: jest.fn() } }));

beforeEach(() => {
  (SponsorService.getAll as jest.Mock).mockResolvedValue([{ id: 'a', name: 'Negocio A' }, { id: 'b', name: 'Negocio B' }]);
  (AnalyticsService.getReport as jest.Mock).mockResolvedValue({ visits: 12, browseClicks: 8, linkClicks: 5, links: [
    { businessId: 'a', url: 'https://wa.me/50600000000', network: 'whatsapp', clicks: 3 },
    { businessId: 'b', url: 'https://www.instagram.com/negociob', network: 'instagram', clicks: 2 },
  ] });
});

it('shows totals and filters exact URLs by business', async () => {
  render(<ChakraProvider><AnalyticsAdmin /></ChakraProvider>);
  expect(await screen.findByText('https://wa.me/50600000000')).toBeTruthy();
  expect(screen.getByText('12')).toBeTruthy();
  expect(screen.getByText('8')).toBeTruthy();
  expect(screen.getByText('5')).toBeTruthy();
  fireEvent.change(screen.getByRole('combobox', { name: 'Negocio' }), { target: { value: 'a' } });
  expect(screen.getByText('https://wa.me/50600000000')).toBeTruthy();
  expect(screen.queryByText('https://www.instagram.com/negociob')).toBeNull();
});

it('shows a recoverable failure instead of false zero counts', async () => {
  (AnalyticsService.getReport as jest.Mock).mockRejectedValueOnce(new Error('permission-denied'));
  render(<ChakraProvider><AnalyticsAdmin /></ChakraProvider>);
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByText('0')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
  expect(await screen.findByText('https://wa.me/50600000000')).toBeTruthy();
});

it('keeps unknown businesses identifiable without using IDs as their display name', async () => {
  (AnalyticsService.getReport as jest.Mock).mockResolvedValueOnce({ visits: 1, browseClicks: 0, linkClicks: 1, links: [
    { businessId: 'deleted-business', url: 'https://example.com/?tracking=long', network: 'website', clicks: 1 },
  ] });
  render(<ChakraProvider><AnalyticsAdmin /></ChakraProvider>);
  expect(await screen.findByText('Ver identificador')).toBeTruthy();
  expect(screen.getByText('deleted-business')).toBeTruthy();
  expect(screen.getByText('example.com')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Abrir enlace ↗' }).getAttribute('href')).toBe('https://example.com/?tracking=long');
});
