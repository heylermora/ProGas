import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import DeviceLocationMap from './DeviceLocationMap';

describe('DeviceLocationMap', () => {
  it('renders its GPS guidance without requiring FormControl styles context', () => {
    render(
      <ChakraProvider>
        <DeviceLocationMap />
      </ChakraProvider>,
    );

    expect(screen.getByRole('button', { name: /usar mi ubicación/i })).toBeTruthy();
    expect(screen.getByText(/solo necesita aceptar el permiso/i)).toBeTruthy();
  });
});
