import { Box, Button, Flex, Spinner, Text, useColorMode } from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import { lazy, Suspense, useState } from 'react';
import { Categories, EmojiStyle, Theme } from 'emoji-picker-react';

const EmojiPicker = lazy(() => import('emoji-picker-react'));
export default function EmojiField({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const { colorMode } = useColorMode();
  return <FormField label="Ícono" help="Elegí un solo emoji para esta categoría.">
    <Flex align="center" gap={3}>
      <Box role="img" aria-label={`Ícono seleccionado: ${value}`} boxSize="56px" display="grid" placeItems="center" fontSize="32px" borderWidth="1px" borderRadius="14px">{value}</Box>
      <Button type="button" variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Cerrar selector' : 'Elegir emoji'}</Button>
    </Flex>
    {open && <Box mt={3} minW={0} maxW="100%" sx={{ '--epr-emoji-size': '28px' }}>
      <Text fontSize="sm" mb={2}>Explorá todos los emojis o buscá uno.</Text>
      <Suspense fallback={<Flex role="status" gap={2} align="center"><Spinner size="sm" />Cargando emojis…</Flex>}>
        <EmojiPicker width="100%" height={380} theme={colorMode === 'dark' ? Theme.DARK : Theme.LIGHT} emojiStyle={EmojiStyle.NATIVE} lazyLoadEmojis searchPlaceholder="Buscar emoji" searchClearButtonLabel="Limpiar búsqueda" previewConfig={{ showPreview: false }} onEmojiClick={selection => { onChange(selection.emoji); setOpen(false); }} categories={[
          { category: Categories.SUGGESTED, name: 'Recientes' },
          { category: Categories.SMILEYS_PEOPLE, name: 'Caras y personas' },
          { category: Categories.ANIMALS_NATURE, name: 'Animales y naturaleza' },
          { category: Categories.FOOD_DRINK, name: 'Alimentos y bebidas' },
          { category: Categories.TRAVEL_PLACES, name: 'Viajes y lugares' },
          { category: Categories.ACTIVITIES, name: 'Actividades' },
          { category: Categories.OBJECTS, name: 'Objetos' },
          { category: Categories.SYMBOLS, name: 'Símbolos' },
          { category: Categories.FLAGS, name: 'Banderas' },
        ]} />
      </Suspense>
    </Box>}
  </FormField>;
}
