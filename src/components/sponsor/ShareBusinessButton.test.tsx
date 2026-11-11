import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ShareBusinessButton from './ShareBusinessButton';
const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share');
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const setup = () => render(<ChakraProvider><ShareBusinessButton businessId="local" name="Mi negocio" /></ChakraProvider>);
beforeEach(() => { Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }); });
afterEach(() => {
  if (shareDescriptor) Object.defineProperty(navigator, 'share', shareDescriptor); else Reflect.deleteProperty(navigator, 'share');
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor); else Reflect.deleteProperty(navigator, 'clipboard');
});
it('uses native sharing with the direct business URL', async () => {
  const share = jest.fn().mockResolvedValue(undefined); Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  setup(); fireEvent.click(screen.getByRole('button', { name: 'Compartir negocio' }));
  await waitFor(() => expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Mi negocio', url: 'http://localhost/#/mall?business=local' })));
});
it('copies the direct link when native sharing is unavailable', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  setup(); fireEvent.click(screen.getByRole('button', { name: 'Compartir negocio' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('http://localhost/#/mall?business=local'));
  await screen.findByText('Enlace del negocio copiado');
});
it('does not copy or show an error when the user cancels native sharing', async () => {
  const share = jest.fn().mockRejectedValue(new DOMException('Canceled', 'AbortError'));
  const writeText = jest.fn(); Object.defineProperty(navigator, 'share', { configurable: true, value: share }); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  setup(); fireEvent.click(screen.getByRole('button', { name: 'Compartir negocio' }));
  await waitFor(() => expect((screen.getByRole('button', { name: 'Compartir negocio' }) as HTMLButtonElement).disabled).toBe(false));
  expect(writeText).not.toHaveBeenCalled(); expect(screen.queryByRole('dialog')).toBeNull();
});
it('shows a selectable link when clipboard permission fails', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: jest.fn().mockRejectedValue(new Error('Denied')) } });
  setup(); fireEvent.click(screen.getByRole('button', { name: 'Compartir negocio' }));
  const input = await screen.findByRole('textbox', { name: 'Enlace del negocio' });
  expect((input as HTMLInputElement).value).toBe('http://localhost/#/mall?business=local');
});
