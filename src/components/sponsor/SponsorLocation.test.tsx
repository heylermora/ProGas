import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import SponsorLocation from './SponsorLocation';

it('shows directions and both navigation options for an exact point', () => {
  render(<ChakraProvider><SponsorLocation sponsor={{ coordinates: '9.798,-84.162', directions: 'Frente al parque' }} /></ChakraProvider>);
  expect(screen.getByText('Frente al parque', { exact: false })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Google Maps' }).getAttribute('href')).toContain('query=9.798%2C-84.162');
  expect(screen.getByRole('link', { name: 'Waze' }).getAttribute('href')).toContain('ll=9.798%2C-84.162');
});

it('keeps directions visible without inventing a map point', () => {
  render(<ChakraProvider><SponsorLocation sponsor={{ directions: 'Frente al parque' }} /></ChakraProvider>);
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.getByText('Frente al parque', { exact: false })).toBeTruthy();
});
