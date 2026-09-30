import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import AppErrorBoundary from './AppErrorBoundary';

function BrokenView(): JSX.Element {
  throw new Error('render failed');
}

describe('AppErrorBoundary', () => {
  it('shows a recoverable fallback when a child cannot render', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const reload = jest.fn();
    render(
      <ChakraProvider>
        <AppErrorBoundary onReload={reload}><BrokenView /></AppErrorBoundary>
      </ChakraProvider>,
    );

    expect(screen.getByRole('heading', { name: /no pudimos mostrar esta pantalla/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /recargar aplicación/i }));
    expect(reload).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
