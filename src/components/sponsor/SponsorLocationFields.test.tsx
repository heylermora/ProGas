import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import SponsorItem from 'interfaces/SponsorItem';
import SponsorLocationFields from './SponsorLocationFields';

function Example() {
  const [value, setValue] = useState<Pick<SponsorItem, 'mapsUrl' | 'wazeUrl' | 'coordinates' | 'directions'>>({});
  return <ChakraProvider><SponsorLocationFields value={value} onChange={setValue} /></ChakraProvider>;
}

it('accepts a short Maps share link without guessing a Waze destination', () => {
  render(<Example />);
  fireEvent.change(screen.getByLabelText('Enlace de Google Maps'), { target: { value: 'https://maps.app.goo.gl/local123' } });
  expect(screen.getByRole('link', { name: 'Google Maps' }).getAttribute('href')).toBe('https://maps.app.goo.gl/local123');
  expect(screen.queryByRole('link', { name: 'Waze' })).toBeNull();
});

it('fills both destinations with GPS and removes the old route when Maps changes', async () => {
  const previous = navigator.geolocation;
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (success: PositionCallback) => success({ coords: { latitude: 9.798, longitude: -84.162, accuracy: 5 } } as GeolocationPosition) } });
  try {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Estoy en el negocio: usar mi ubicación' }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Waze' }).getAttribute('href')).toContain('ll=9.798%2C-84.162'));
    fireEvent.change(screen.getByLabelText('Enlace de Google Maps'), { target: { value: 'https://maps.app.goo.gl/other123' } });
    expect(screen.queryByRole('link', { name: 'Waze' })).toBeNull();
    expect((screen.getByLabelText('Enlace de Waze') as HTMLInputElement).value).toBe('');
  } finally { Object.defineProperty(navigator, 'geolocation', { configurable: true, value: previous }); }
});
