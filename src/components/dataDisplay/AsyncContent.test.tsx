import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import AsyncContent from './AsyncContent';

const renderContent = (props: React.ComponentProps<typeof AsyncContent>) => render(
  <ChakraProvider><AsyncContent {...props} /></ChakraProvider>,
);

describe('AsyncContent', () => {
  it('announces loading without rendering stale content', () => {
    renderContent({ isLoading: true, loadingLabel: 'Verificando acceso', children: <div>Privado</div> });
    expect(screen.getByRole('status').textContent).toContain('Verificando acceso');
    expect(screen.queryByText('Privado')).toBeNull();
  });

  it('announces an error and otherwise renders its children', () => {
    const { rerender } = renderContent({ isLoading: false, error: 'No disponible', children: <div>Contenido</div> });
    expect(screen.getByRole('alert').textContent).toContain('No disponible');
    rerender(<ChakraProvider><AsyncContent isLoading={false}><div>Contenido</div></AsyncContent></ChakraProvider>);
    expect(screen.getByText('Contenido')).toBeTruthy();
  });
});
