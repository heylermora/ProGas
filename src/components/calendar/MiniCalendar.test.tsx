import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import MiniCalendar from './MiniCalendar';
import theme from 'theme/theme';

const renderCalendar = (selectRange = false) => render(
  <ChakraProvider theme={theme}>
    <MiniCalendar selectRange={selectRange} data-testid="mini-calendar-card" />
  </ChakraProvider>
);

describe('MiniCalendar component', () => {
  it('renders with the current year default range', () => {
    renderCalendar();

    expect(screen.getByText(`January ${new Date().getFullYear()}`)).toBeTruthy();
    expect(screen.getByTestId('mini-calendar-card')).toBeTruthy();
  });

  it('supports month navigation controls', () => {
    renderCalendar();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText(`February ${new Date().getFullYear()}`)).toBeTruthy();
  });

  it('renders the calendar successfully when range selection is enabled', () => {
    renderCalendar(true);

    expect(screen.getByTestId('mini-calendar-card')).toBeTruthy();
    expect(screen.getByText(`January ${new Date().getFullYear()}`)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /january/i }).length).toBeGreaterThan(0);
  });
});
