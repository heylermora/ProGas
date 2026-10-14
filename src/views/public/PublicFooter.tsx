import { SocialContact } from 'components/social/SocialLink';
import { Box, Button, Flex, Icon, Image, Link, Text } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdHome, MdLogin, MdShoppingCart, MdCode } from 'react-icons/md';
import packageInfo from '../../../package.json';

const portfolioContactUrl = `https://wa.me/50683508585?text=${encodeURIComponent('Hola Johel, vi su portafolio y me gustaría conversar sobre un proyecto.')}`;

export default function PublicFooter() {
  const location = useLocation();
  const isPortfolio = location.pathname === '/portfolio';

  return (
    <Box as="footer" mt={{ base: '24px', md: '40px' }} overflow="hidden" bg="linear-gradient(135deg, #130D48 0%, #25116E 100%)" color="white" borderRadius={{ base: '20px', md: '24px' }} boxShadow="0 14px 36px rgba(51, 17, 219, .18)">
      <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '6px', md: '24px' }} px={{ base: '16px', md: '26px' }} pt={{ base: '16px', md: '20px' }} pb={{ base: '8px', md: '20px' }}>
        <Flex align="center" gap="10px" minW="0">
          <Image src={`${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`} alt="" boxSize="40px" objectFit="contain" flexShrink={0} />
          <Box minW="0"><Text fontSize="sm" fontWeight="800" lineHeight="1.3">Gas Memo</Text><Text color="whiteAlpha.800" fontSize="xs" lineHeight="1.4">Un espacio para el comercio local</Text></Box>
        </Flex>
        <Flex wrap="wrap" align="center" gap={{ base: '4px', md: '8px' }} w={{ base: '100%', md: 'auto' }}>
          {location.pathname !== '/' && <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" color="white" size="sm" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Inicio</Button>}
          {location.pathname.startsWith('/customer/') && location.pathname !== '/customer/data' && <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" color="white" size="sm" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Hacer pedido</Button>}
          {isPortfolio ? <SocialContact href={portfolioContactUrl} caption="Contactar" /> : <Button as={RLink} to="/portfolio" leftIcon={<MdCode />} size="sm" variant="ghost" minH="44px" maxW="100%" px="8px" whiteSpace="normal" borderRadius="12px" fontSize="xs" fontWeight="500" color="cyan.100" _hover={{ bg: 'whiteAlpha.100', color: 'white' }}>Creado por Johel Mora</Button>}
        </Flex>
      </Flex>

      <Flex px={{ base: '16px', md: '26px' }} py={{ base: '4px', md: '6px' }} bg="blackAlpha.300" borderTop="1px solid" borderColor="whiteAlpha.100" direction="row" align="center" justify="space-between" gap="8px">
        <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} minW="0" flexWrap="wrap" columnGap="8px" rowGap="2px" color="whiteAlpha.800" fontSize="11px">
          <Text>© {new Date().getFullYear()} Gas Memo</Text><Text aria-hidden="true" display={{ base: 'none', sm: 'block' }}>•</Text><Text>Versión {packageInfo.version}</Text>
        </Flex>
        <Link as={RLink} to="/auth/sign-in" color="whiteAlpha.800" fontSize="11px" minH="44px" flexShrink={0} px="4px" display="inline-flex" alignItems="center" gap="4px" aria-label="Acceso administrativo" _hover={{ color: 'white', textDecoration: 'underline' }}><Icon as={MdLogin} boxSize="12px" /> Acceso</Link>
      </Flex>
    </Box>
  );
}
