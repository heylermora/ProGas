import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import PublicHeader from './PublicHeader';

const renderHeader = (path: string, state?: Record<string, string>) => {
  const history = createMemoryHistory({ initialEntries: [{ pathname: path, state }] });
  render(<ChakraProvider><Router history={history}><PublicHeader /></Router></ChakraProvider>);
  return history;
};

describe('PublicHeader', () => {
  it('returns to the previous order step without adding another history entry', () => {
    const history = renderHeader('/customer/info');
    fireEvent.click(screen.getByRole('button', { name: /volver a verificación/i }));
    expect(history.location.pathname).toBe('/customer/data');
    expect(history.length).toBe(1);
  });

  it('uses the origin supplied by the mall preview', () => {
    const history = renderHeader('/mall', { from: '/customer/products', fromLabel: 'Volver al pedido' });
    fireEvent.click(screen.getByRole('button', { name: /volver al pedido/i }));
    expect(history.location.pathname).toBe('/customer/products');
  });
});
