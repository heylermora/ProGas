import { Box, Button, Flex, Icon, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdArrowForward, MdCode, MdHome, MdLogin, MdShoppingCart, MdWork } from 'react-icons/md';
import packageInfo from '../../../package.json';

export default function PublicFooter() {
  const location = useLocation();

  return (
    <Box as="footer" mt={{ base: '36px', md: '56px' }} overflow="hidden" bg="linear-gradient(135deg, #11047A 0%, #3311DB 52%, #7551FF 100%)" color="white" borderRadius={{ base: '22px', md: '30px' }} boxShadow="0 20px 50px rgba(51, 17, 219, .22)" border="1px solid" borderColor="whiteAlpha.300">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: '16px', md: '24px' }} alignItems="stretch" px={{ base: '16px', md: '26px' }} py={{ base: '18px', md: '24px' }}>
        <Stack spacing={{ base: '12px', md: '14px' }} justify="center">
          <Flex align="center" gap="12px">
            <Flex bg="brand.500" color="white" w="48px" h="48px" flexShrink={0} borderRadius="16px" align="center" justify="center" fontWeight="900" letterSpacing="-.04em" boxShadow="0 8px 22px rgba(79, 70, 229, .35)">GM</Flex>
            <Box>
              <Text fontWeight="900" fontSize="lg" lineHeight="1.15">Gas Memo</Text>
              <Text color="whiteAlpha.600" fontSize="sm">Pedidos y comercios de nuestra comunidad</Text>
            </Box>
          </Flex>
          <Text color="whiteAlpha.700" fontSize="sm" lineHeight="1.55" maxW="480px">Comprá fácil, apoyá lo local y conectá con los emprendimientos de Acosta.</Text>
          <Flex wrap="wrap" gap="8px">
            {location.pathname !== '/' && <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" bg="whiteAlpha.100" color="white" size="sm" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Inicio</Button>}
            {location.pathname !== '/' && location.pathname !== '/customer/data' && <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" bg="whiteAlpha.100" color="white" size="sm" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Hacer pedido</Button>}
          </Flex>
        </Stack>

        <Flex direction="column" justify="center" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" borderRadius="20px" p={{ base: '16px', md: '20px' }} position="relative" overflow="hidden">
          <Box position="absolute" right="-22px" top="-28px" w="100px" h="100px" borderRadius="full" bg="purple.400" opacity=".14" />
          <Flex align="center" gap="8px" color="cyan.200" mb="8px"><Icon as={MdCode} /><Text fontSize="xs" fontWeight="900" letterSpacing=".1em">HECHO EN ACOSTA</Text></Flex>
          <Text fontWeight="900" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.25">¿Tu emprendimiento necesita una presencia digital que venda?</Text>
          <Text mt="6px" color="whiteAlpha.700" fontSize="xs" lineHeight="1.5">Conocé el trabajo de <Box as="span" color="white" fontWeight="800">Johel Mora</Box> y llevemos tu idea al siguiente nivel.</Text>
          <Button as={RLink} to="/portfolio" mt="12px" alignSelf="flex-start" rightIcon={<MdArrowForward />} leftIcon={<MdWork />} size="sm" borderRadius="full" bg="white" color="brand.800" fontWeight="900" _hover={{ bg: 'brand.100', transform: 'translateX(2px)' }}>Ver portafolio profesional</Button>
        </Flex>
      </SimpleGrid>

      <Flex px={{ base: '16px', md: '26px' }} py={{ base: '10px', md: '12px' }} bg="blackAlpha.300" borderTop="1px solid" borderColor="whiteAlpha.100" direction="row" align="center" justify="space-between" gap="8px">
        <Flex align="center" wrap="wrap" gap="8px" color="whiteAlpha.500" fontSize="11px">
          <Text>© {new Date().getFullYear()} Gas Memo</Text><Text aria-hidden="true">•</Text><Text>Versión {packageInfo.version}</Text>
        </Flex>
        <Link as={RLink} to="/auth/sign-in" color="whiteAlpha.400" fontSize="10px" display="inline-flex" alignItems="center" gap="4px" aria-label="Acceso administrativo" _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}><Icon as={MdLogin} boxSize="12px" /> Acceso</Link>
      </Flex>
    </Box>
  );
}
