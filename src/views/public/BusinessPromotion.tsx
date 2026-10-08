import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';

const promotionMessage = 'Hola, Gas Memo. Tengo un negocio en Acosta y quiero promocionarlo en su directorio. ¿Me pueden compartir qué incluye la publicación, los costos y cómo participar?';
const promotionUrl = `https://wa.me/50683978524?text=${encodeURIComponent(promotionMessage)}`;

export default function BusinessPromotion() {
  return (
    <Box as="footer" role="group" aria-label="Promocione su negocio" borderTop="1px solid" borderColor="#DDE5F5" bg="#E8EDF9" px={{ base: 5, md: 8 }} py={4}>
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }}
        justify="space-between" gap={3} maxW="940px" mx="auto">
        <Box minW="0">
          <Heading as="h2" fontSize="md" color="#172554" lineHeight="1.4">Su negocio también puede estar aquí.</Heading>
          <Text fontSize="sm" color="#475569" mt={1}>Consulte con Gas Memo cómo promocionarlo en Acosta.</Text>
        </Box>
        <Button as="a" href={promotionUrl} target="_blank" rel="noopener noreferrer"
          leftIcon={<FaWhatsapp />} bg="#342267" color="white" fontSize="sm" fontWeight="700"
          borderRadius="full" minH="44px" h="auto" py={2} px={5} flexShrink={0}
          whiteSpace="normal" textAlign="center" lineHeight="1.4" maxW="100%"
          _hover={{ bg: '#49348A' }}
          _focusVisible={{ outline: '3px solid', outlineColor: '#342267', outlineOffset: '3px' }}>
          Quiero promocionar mi negocio
        </Button>
      </Flex>
    </Box>
  );
}
