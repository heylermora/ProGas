import { Box, Button, Flex, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdHandshake, MdHome, MdLogin, MdShoppingCart } from 'react-icons/md';

export default function PublicFooter() {
  const location = useLocation();
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const panelBg = useColorModeValue('white', 'navy.800');
  const actionBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const logoBg = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box
      as="footer"
      mt={{ base: '32px', md: '48px' }}
      px={{ base: '16px', md: '22px' }}
      py={{ base: '18px', md: '20px' }}
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius={{ base: '20px', md: '24px' }}
      boxShadow="0 12px 34px rgba(25, 32, 56, 0.08)"
    >
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'center' }}
        justify="space-between"
        gap={{ base: '18px', lg: '28px' }}
      >
        <Flex align="center" gap="12px" minW="fit-content">
          <Flex
            bg={logoBg}
            color="white"
            w="44px"
            h="44px"
            flexShrink={0}
            borderRadius="15px"
            align="center"
            justify="center"
            fontWeight="900"
            letterSpacing="-0.03em"
          >
            GM
          </Flex>
          <Box>
            <Text fontWeight="900" lineHeight="1.15">Gas Memo</Text>
            <Text color={textColor} fontSize="sm">Pedidos y comercios locales</Text>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="8px" w={{ base: '100%', lg: 'auto' }}>
          {location.pathname !== '/' && (
            <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" bg={actionBg} colorScheme="brand" size="sm" borderRadius="full" px="16px">
              Inicio
            </Button>
          )}
          {location.pathname !== '/customer/data' && (
            <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" bg={actionBg} colorScheme="brand" size="sm" borderRadius="full" px="16px">
              Hacer pedido
            </Button>
          )}
          {location.pathname !== '/mall' && (
            <Button
              as={RLink}
              to={{ pathname: '/mall', state: { from: location.pathname, fromLabel: 'Volver' } }}
              leftIcon={<MdHandshake />}
              colorScheme="brand"
              size="sm"
              borderRadius="full"
              px="16px"
            >
              Explorar comercios
            </Button>
          )}
          <Button as={RLink} to="/auth/sign-in" leftIcon={<MdLogin />} variant="ghost" bg={actionBg} colorScheme="brand" size="sm" borderRadius="full" px="16px">
            Iniciar sesión
          </Button>
        </SimpleGrid>
      </Flex>

      <Flex
        mt="16px"
        pt="14px"
        borderTop="1px solid"
        borderColor={borderColor}
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        gap="4px"
      >
        <Text color={textColor} fontSize="xs">
          Compra fácil y descubre negocios de tu comunidad.
        </Text>
        <Text color={textColor} fontSize="xs">
          Desarrollado por <Box as="span" fontWeight="700">Johel Mora</Box>
        </Text>
      </Flex>
    </Box>
  );
}
