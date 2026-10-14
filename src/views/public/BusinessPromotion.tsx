import { SocialContact } from 'components/social/SocialLink';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';

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
        <SocialContact href={promotionUrl} caption="Quiero promocionar mi negocio" />
      </Flex>
    </Box>
  );
}
