import { Box, Button, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdHandshake, MdHome, MdLogin, MdShoppingCart } from 'react-icons/md';

export default function PublicFooter() {
  const location = useLocation();
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
        <HStack spacing="10px" flexWrap="wrap">
          {location.pathname !== '/' && <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" colorScheme="brand" size="sm">Inicio</Button>}
          {location.pathname !== '/customer/data' && <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" colorScheme="brand" size="sm">Hacer pedido</Button>}
          {location.pathname !== '/mall' && <Button as={RLink} to={{ pathname: '/mall', state: { from: location.pathname, fromLabel: 'Volver' } }} leftIcon={<MdHandshake />} colorScheme="brand" size="sm">Explorar comercios</Button>}
          <Button as={RLink} to="/auth/sign-in" leftIcon={<MdLogin />} variant="ghost" colorScheme="brand" size="sm">
            Iniciar sesión
          </Button>
        </HStack>
      </Flex>
      <Text color={textColor} fontSize="xs" mt="14px">
        Gas Memo conecta clientes, pedidos y comercios locales en una experiencia simple y rápida.
      </Text>
    </Box>
  );
}
