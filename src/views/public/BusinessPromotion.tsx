import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';

import { Link } from 'react-router-dom';

export default function BusinessPromotion() {
  return (
    <Box as="footer" role="group" aria-label="Promocione su negocio" borderTop="1px solid" borderColor="#DDE5F5" bg="#E8EDF9" px={{ base: 5, md: 8 }} py={4}>
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }}
        justify="space-between" gap={3} maxW="940px" mx="auto">
        <Box minW="0">
          <Heading as="h2" fontSize="md" color="#172554" lineHeight="1.4">Su negocio también puede estar aquí.</Heading>
          <Text fontSize="sm" color="#475569" mt={1}>Enviá una solicitud para aparecer en el directorio de comercios de Acosta.</Text>
        </Box>
        <Button as={Link} to="/promocionar-negocio" colorScheme="brand">Quiero promocionar mi negocio</Button>
      </Flex>
    </Box>
  );
}
