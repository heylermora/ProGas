import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SponsorStrip from './SponsorStrip';
import theme from 'theme/theme';

const renderSponsorStrip = () => render(
  <ChakraProvider theme={theme}>
    <MemoryRouter>
      <SponsorStrip
        type="VIP"
        max={1}
        sponsors={[{
          id: 'sponsor-with-video',
          type: 'VIP',
          name: 'Patrocinador de prueba',
          active: true,
          videoUrl: 'https://example.com/sponsor.mp4',
        }]}
      />
    </MemoryRouter>
  </ChakraProvider>
);

describe('SponsorStrip video player', () => {
  it('unmounts the inline player while its expanded player is open', () => {
    const { container } = renderSponsorStrip();

    fireEvent.click(screen.getByRole('button', { name: /ver video de patrocinador de prueba/i }));
    expect(container.querySelectorAll('video')).toHaveLength(1);

    const backButton = screen.getByRole('button', { name: /volver al logo y links del patrocinador/i });
    const expandButton = screen.getByRole('button', { name: /expandir video de patrocinador de prueba/i });

    expect(backButton.parentElement).toBe(expandButton.parentElement);
    fireEvent.click(expandButton);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.querySelectorAll('video')).toHaveLength(1);
  });
});
