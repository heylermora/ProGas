import AnalyticsService from 'services/AnalyticsService';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import SocialLink, { SocialContact } from './SocialLink';

describe('shared social links', () => {
  beforeEach(() => jest.clearAllMocks());
  it('preserves TikTok URLs containing @ and secures external tabs', () => {
    const href = 'https://www.tiktok.com/@negocio';
    render(<ChakraProvider><SocialLink href={href} /></ChakraProvider>);
    const link = screen.getByRole('link', { name: 'TikTok' });
    expect(link.getAttribute('href')).toBe(href);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('normalizes a bare email without opening another browser tab', () => {
    render(<ChakraProvider><SocialLink href="contacto@negocio.test" label="Correo del negocio" /></ChakraProvider>);
    const link = screen.getByRole('link', { name: 'Correo del negocio' });
    expect(link.getAttribute('href')).toBe('mailto:contacto@negocio.test');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('retains the purpose and click behavior of WhatsApp sharing actions', () => {
    const send = jest.fn();
    render(<ChakraProvider><SocialContact network="whatsapp" caption="Enviar por WhatsApp" onClick={send} /></ChakraProvider>);
    const button = screen.getByRole('button', { name: 'Enviar por WhatsApp' });
    expect(screen.getByText('Enviar por WhatsApp')).toBeTruthy();
    fireEvent.click(button);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('tracks a business destination without replacing the original click handler or link', () => {
    const click = jest.fn();
    const href = 'https://www.instagram.com/negocio';
    render(<ChakraProvider><SocialLink href={href} businessId="business-a" source="mall-preview" onClick={click} /></ChakraProvider>);
    fireEvent.click(screen.getByRole('link', { name: 'Instagram' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(AnalyticsService.track).toHaveBeenCalledWith({ type: 'link_click', businessId: 'business-a', url: href, source: 'mall-preview' });
  });

  it('omits canceled clicks and URLs without a published business context', () => {
    const href = 'https://wa.me/50600000000';
    render(<ChakraProvider><SocialLink href={href} label="Cancelado" businessId="business-a" onClick={event => event.preventDefault()} /><SocialLink href={href} label="Contacto general" /></ChakraProvider>);
    fireEvent.click(screen.getByRole('link', { name: 'Cancelado' }));
    fireEvent.click(screen.getByRole('link', { name: 'Contacto general' }));
    expect(AnalyticsService.track).not.toHaveBeenCalled();
  });

});
