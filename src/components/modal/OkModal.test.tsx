import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import OkModal from './OkModal';

describe('OkModal', () => {
  it('shows the order code and a dedicated copy action', () => {
    render(
      <ChakraProvider>
        <OkModal message="Pedido creado correctamente." code="73NH7ÑFAXQ2I" isOpen onClose={() => undefined} />
      </ChakraProvider>,
    );

    expect(screen.getByText('73NH7ÑFAXQ2I')).toBeTruthy();
    expect(screen.getByRole('button', { name: /copiar código/i })).toBeTruthy();
  });
});
