import { SocialContact } from 'components/social/SocialLink';
import { Box, Button, Flex, Icon, Image, Link, Text } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdHome, MdLogin, MdShoppingCart } from 'react-icons/md';
import AppVersion from 'components/dataDisplay/AppVersion';

const portfolioContactUrl = `https://wa.me/50683508585?text=${encodeURIComponent('Hola Johel, vi su portafolio y me gustaría conversar sobre un proyecto.')}`;

export default function PublicFooter() {
  const location = useLocation();
  const isPortfolio = location.pathname === '/portfolio';

  return (
    <Box as="footer" mt={{ base: '24px', md: '40px' }} overflow="hidden" bg="brand.500" color="white" borderRadius={{ base: '20px', md: '24px' }}>
      <Flex align="center" justify="space-between" direction={{ base: 'column', md: 'row' }} gap={{ base: '16px', md: '24px' }} px={{ base: '20px', md: '28px' }} py={{ base: '24px', md: '20px' }}>
        <Flex align="center" direction={{ base: 'column', md: 'row' }} gap={{ base: '10px', md: '16px' }} minW="0">
          <Image src={`${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`} alt="Gas Memo" w={{ base: '36px', md: '42px' }} h={{ base: '64px', md: '72px' }} objectFit="cover" flexShrink={0} />
          <Box minW="0" textAlign={{ base: 'center', md: 'left' }}>
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" lineHeight="1.3">Negocios de Acosta</Text>
            <Text color="whiteAlpha.900" mt="4px" fontSize="xs" lineHeight="1.5">Un espacio para el comercio local</Text>
          </Box>
        </Flex>
        <Flex direction="column" align={{ base: 'center', md: 'flex-end' }} gap="4px" minW="0">
          {location.pathname !== '/' && <Flex wrap="wrap" align="center" justify="center" gap="4px">
            <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" color="white" size="sm" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Inicio</Button>
            {location.pathname.startsWith('/customer/') && location.pathname !== '/customer/data' && <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" color="white" size="sm" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Hacer pedido</Button>}
          </Flex>}
          {isPortfolio ? <SocialContact href={portfolioContactUrl} caption="Contactar" /> : <Link as={RLink} to="/portfolio" display="inline-flex" alignItems="center" justifyContent="center" flexWrap="wrap" columnGap="5px" minH="44px" fontSize="xs" color="whiteAlpha.900" _hover={{ color: 'white', textDecoration: 'underline' }} _focusVisible={{ outline: '2px solid', outlineColor: 'white', outlineOffset: '4px', borderRadius: '4px' }}>
            <Text as="span">Creado por</Text><Text as="span" fontWeight="600" color="white">Johel Mora Calderón</Text>
          </Link>}
        </Flex>
      </Flex>
      <Flex px={{ base: '20px', md: '28px' }} py="8px" bg="brand.600" borderTop="1px solid" borderColor="whiteAlpha.200" align="center" justify="space-between" gap="12px">
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} minW="0" flexWrap="wrap" columnGap="8px" rowGap="2px" color="whiteAlpha.900" fontSize="11px">
          <Text>© {new Date().getFullYear()} Gas Memo</Text><Text aria-hidden="true" display={{ base: 'none', md: 'block' }}>•</Text><AppVersion />
        </Flex>
        <Link as={RLink} to="/auth/sign-in" color="whiteAlpha.900" fontSize="11px" minH="44px" flexShrink={0} px="4px" display="inline-flex" alignItems="center" gap="4px" aria-label="Acceso administrativo" _hover={{ color: 'white', textDecoration: 'underline' }}><Icon as={MdLogin} boxSize="12px" /> Acceso</Link>
      </Flex>
    </Box>
  );
}
