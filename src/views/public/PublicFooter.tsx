import { SocialContact } from 'components/social/SocialLink';
import { Box, Button, Flex, Icon, Image, Link, Text } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import { MdHome, MdLogin, MdShoppingCart } from 'react-icons/md';
import packageInfo from '../../../package.json';

const portfolioContactUrl = `https://wa.me/50683508585?text=${encodeURIComponent('Hola Johel, vi su portafolio y me gustaría conversar sobre un proyecto.')}`;

export default function PublicFooter() {
  const location = useLocation();
  const isPortfolio = location.pathname === '/portfolio';

  return (
    <Box as="footer" mt={{ base: '24px', md: '40px' }} overflow="hidden" bg="#17213A" color="white" borderRadius={{ base: '18px', md: '22px' }} border="1px solid" borderColor="whiteAlpha.100">
      <Flex align="center" justify="space-between" direction={{ base: 'column', md: 'row' }} gap="12px" px={{ base: '20px', md: '28px' }} py={{ base: '20px', md: '24px' }}>
        <Flex align="center" justify="flex-start" gap="16px" minW="0" w={{ base: '100%', md: 'auto' }}>
          <Image src={`${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`} alt="Gas Memo" w="42px" h="72px" objectFit="cover" flexShrink={0} />
          <Box minW="0"><Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" lineHeight="1.3">Negocios de Acosta</Text><Text color="#B9C4D8" mt="5px" fontSize="xs" lineHeight="1.5" maxW="210px">Un espacio para el comercio local</Text></Box>
        </Flex>
        {(location.pathname !== '/' || isPortfolio) && <Flex wrap="wrap" align="center" justify="flex-start" gap={{ base: '4px', md: '8px' }} w={{ base: '100%', md: 'auto' }}>
          {location.pathname !== '/' && <Button as={RLink} to="/" leftIcon={<MdHome />} variant="ghost" color="white" size="sm" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Inicio</Button>}
          {location.pathname.startsWith('/customer/') && location.pathname !== '/customer/data' && <Button as={RLink} to="/customer/data" leftIcon={<MdShoppingCart />} variant="ghost" color="white" size="sm" minH="44px" borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>Hacer pedido</Button>}
          {isPortfolio && <SocialContact href={portfolioContactUrl} caption="Contactar" />}
        </Flex>}
      </Flex>

      {!isPortfolio && <Box px={{ base: '20px', md: '28px' }} pb="16px">
        <Link as={RLink} to="/portfolio" display="inline-flex" alignItems="center" flexWrap="wrap" columnGap="5px" minH="44px" fontSize="xs" color="#B9C4D8" _hover={{ color: 'white', textDecoration: 'underline' }} _focusVisible={{ outline: '2px solid', outlineColor: 'white', outlineOffset: '4px', borderRadius: '4px' }}>
          <Text as="span">Creado por</Text><Text as="span" fontWeight="600" color="white">Johel Mora Calderón</Text>
        </Link>
      </Box>}
      <Flex px={{ base: '20px', md: '28px' }} py="8px" borderTop="1px solid" borderColor="whiteAlpha.100" direction="row" align="center" justify="space-between" gap="8px">
        <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} minW="0" flexWrap="wrap" columnGap="8px" rowGap="2px" color="whiteAlpha.800" fontSize="11px">
          <Text>© {new Date().getFullYear()} Gas Memo</Text><Text aria-hidden="true" display={{ base: 'none', sm: 'block' }}>•</Text><Text>Versión {packageInfo.version}</Text>
        </Flex>
        <Link as={RLink} to="/auth/sign-in" color="whiteAlpha.800" fontSize="11px" minH="44px" flexShrink={0} px="4px" display="inline-flex" alignItems="center" gap="4px" aria-label="Acceso administrativo" _hover={{ color: 'white', textDecoration: 'underline' }}><Icon as={MdLogin} boxSize="12px" /> Acceso</Link>
      </Flex>
    </Box>
  );
}
