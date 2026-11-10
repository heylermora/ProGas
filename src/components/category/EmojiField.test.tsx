import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import EmojiField from './EmojiField';
jest.mock('emoji-picker-react', () => ({
  __esModule: true, Categories: {}, EmojiStyle: {}, Theme: {},
  default: ({ onEmojiClick }: { onEmojiClick: (selection: { emoji: string }) => void }) => <><button onClick={() => onEmojiClick({ emoji: '👩🏽‍🍳' })}>Cocinera</button><button onClick={() => onEmojiClick({ emoji: '🥐' })}>Croissant</button></>,
}));
function Field() { const [value, setValue] = useState('🏪'); return <EmojiField value={value} onChange={setValue} />; }
it('selects one complete emoji and replaces it on the next selection', async () => {
  render(<ChakraProvider><Field /></ChakraProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Elegir emoji' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Cocinera' }));
  expect(screen.getByRole('img', { name: 'Ícono seleccionado: 👩🏽‍🍳' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Elegir emoji' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Croissant' }));
  expect(screen.getByRole('img', { name: 'Ícono seleccionado: 🥐' })).toBeTruthy();
  expect(screen.queryByRole('img', { name: /👩🏽‍🍳/ })).toBeNull();
  expect(screen.queryByRole('textbox')).toBeNull();
});
