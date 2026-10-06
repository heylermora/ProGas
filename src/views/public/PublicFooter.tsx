import { Box, Button, Flex, Icon, Link, Text } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdHome, MdLogin, MdShoppingCart, MdWork } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import packageInfo from '../../../package.json';

const portfolioContactUrl = `https://wa.me/50683508585?text=${encodeURIComponent('Hola Johel, vi su portafolio y me gustaría conversar sobre un proyecto.')}`;

export default function PublicFooter() {
  const location = useLocation();
  const isPortfolio = location.pathname === '/portfolio';

  return (
    <Box as="footer" mt={{ base: '36px', md: '52px' }} overflow="hidden" bg="linear-gradient(135deg, #11047A 0%, #3311DB 100%)" color="white" borderRadius={{ base: '20px', md: '24px' }} boxShadow="0 14px 36px rgba(51, 17, 219, .18)">
      <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '16px', md: '24px' }} px={{ base: '18px', md: '26px' }} py={{ base: '20px', md: '22px' }}>
        <Flex align="center" gap="12px">
          <Flex bg="whiteAlpha.200" color="white" w="42px" h="42px" flexShrink={0} borderRadius="14px" align="center" justify="center" fontWeight="900" letterSpacing="-.04em">GM</Flex>
          <Box><Text fontWeight="900" lineHeight="1.15">Gas Memo</Text><Text color="whiteAlpha.700" fontSize="sm">Un espacio para el comercio local</Text></Box>
        </Flex>
        <Flex wrap="wrap" gap="8px" w={{ base: '100%', md: 'auto' }}>
          {location.pathname !== '/' && <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" color="white" size="sm" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Inicio</Button>}
          {location.pathname.startsWith('/customer/') && location.pathname !== '/customer/data' && <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" color="white" size="sm" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Hacer pedido</Button>}
          {isPortfolio ? <Button as="a" href={portfolioContactUrl} target="_blank" rel="noopener noreferrer" leftIcon={<FaWhatsapp />} size="sm" borderRadius="full" bg="white" color="brand.800" _hover={{ bg: 'brand.100' }}>Contactar</Button> : <Button as={RLink} to="/portfolio" leftIcon={<MdWork />} size="sm" borderRadius="full" bg="white" color="brand.800" _hover={{ bg: 'brand.100' }}>Portafolio</Button>}
        </Flex>
      </Flex>

      <Flex px={{ base: '16px', md: '26px' }} py={{ base: '10px', md: '12px' }} bg="blackAlpha.300" borderTop="1px solid" borderColor="whiteAlpha.100" direction="row" align="center" justify="space-between" gap="8px">
        <Flex align="center" wrap="wrap" gap="8px" color="whiteAlpha.500" fontSize="11px">
          <Text>© {new Date().getFullYear()} Gas Memo</Text><Text aria-hidden="true">•</Text><Text>Versión {packageInfo.version}</Text>
        </Flex>
        <Link as={RLink} to="/auth/sign-in" color="whiteAlpha.400" fontSize="10px" display="inline-flex" alignItems="center" gap="4px" aria-label="Acceso administrativo" _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}><Icon as={MdLogin} boxSize="12px" /> Acceso</Link>
      </Flex>
    </Box>
  );
}
