import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { PageSearchProvider, usePageSearch } from 'contexts/PageSearchContext';
import { SearchBar } from './SearchBar';

function QueryValue() {
  const { query } = usePageSearch();
  return <output>{query}</output>;
}

describe('SearchBar', () => {
  it('updates the current page search without navigating away', () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/client/index'] });
    render(
      <ChakraProvider>
        <Router history={history}>
          <PageSearchProvider><SearchBar /><QueryValue /></PageSearchProvider>
        </Router>
      </ChakraProvider>
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar clientes' }), { target: { value: 'Ana' } });

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(history.location.pathname).toBe('/admin/client/index');
    expect(history.length).toBe(1);
  });

  it('is disabled on pages without a searchable listing', () => {
    const history = createMemoryHistory({ initialEntries: ['/admin/order/new'] });
    render(
      <ChakraProvider>
        <Router history={history}>
          <PageSearchProvider><SearchBar /></PageSearchProvider>
        </Router>
      </ChakraProvider>
    );

    expect(screen.getByRole('textbox', { name: 'Búsqueda no disponible' })).toBeDisabled();
  });
});
