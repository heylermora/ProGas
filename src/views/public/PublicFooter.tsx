import React from 'react';
import { Box, Button, Flex, HStack, Link, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';

export default function PublicFooter() {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const logoBg = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box as="footer" mt={{ base: '36px', md: '56px' }} pt="22px" borderTop="1px solid" borderColor={borderColor}>
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="16px">
        <HStack spacing="12px">
          <Box bg={logoBg} color="white" w="42px" h="42px" borderRadius="14px" display="flex" alignItems="center" justifyContent="center" fontWeight="900">
            JM
          </Box>
          <Box>
            <Text color={textColor} fontSize="sm">Desarrollado por</Text>
            <Text fontWeight="800">Johel Mora</Text>
          </Box>
        </HStack>
        <Button as={RLink} to="/sponsors/packages" colorScheme="brand" size="sm">
          Quiero ser patrocinador
        </Button>
      </Flex>
      <Text color={textColor} fontSize="xs" mt="14px">
        ¿Desea anunciarse en Gas Memo? Consulte los paquetes disponibles para patrocinadores.
      </Text>
    </Box>
  );
}
