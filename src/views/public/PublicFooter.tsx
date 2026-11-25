import { SocialContact } from 'components/social/SocialLink';
import { Box, Flex, Image, Link, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink, useLocation } from 'react-router-dom';
import packageInfo from '../../../package.json';

const portfolioContactUrl = `https://wa.me/50683508585?text=${encodeURIComponent('Hola Johel, vi su portafolio y me gustaría conversar sobre un proyecto.')}`;

export default function PublicFooter() {
  const { pathname } = useLocation();
  const surface = useColorModeValue('brand.100', 'navy.900');
  const ink = useColorModeValue('navy.900', 'white');
  const muted = useColorModeValue('gray.700', 'gray.200');
  const divider = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const sponsorLogo = useColorModeValue('Negative', 'Positive');
  const canStartOrder = pathname.startsWith('/customer/') && pathname !== '/customer/data';
  const footerLink = {
    display: 'inline-flex',
    alignItems: 'center',
    minH: '44px',
    fontSize: 'sm',
    fontWeight: '500',
    _hover: { textDecoration: 'underline' },
  };

  return (
    <Box as="footer" mt={{ base: 6, md: 10 }} borderRadius={{ base: '20px', md: '24px' }}
      bg={surface} color={ink} px={{ base: 5, md: 8 }}>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 8 }} py={{ base: 5, md: 6 }}>
        <Flex align="center" gap={3}>
          <Flex boxSize="44px" flexShrink={0} bg="white" borderRadius="12px" align="center" justify="center">
            <Image src={`${process.env.PUBLIC_URL}/ula/isotipo.png`} alt="" h="27px" w="auto" />
          </Flex>
          <Box>
            <Text fontSize="lg" lineHeight="short" fontWeight="700">Ulà</Text>
            <Text fontSize="sm" color={muted}>Negocios de Acosta y alrededores</Text>
          </Box>
        </Flex>
        <Flex role="group" aria-label="Patrocinador" align="center" gap={3} flexShrink={0}>
          <Image src={`${process.env.PUBLIC_URL}/Gas%20Memo/${sponsorLogo}.png`} alt="Gas Memo"
            h="44px" w="32px" objectFit="contain" flexShrink={0} />
          <Text fontSize="sm" color={muted}>Patrocinado por Gas Memo</Text>
        </Flex>
      </Flex>
      <Flex borderTopWidth="1px" borderColor={divider} py={{ base: 2, md: 1 }} justify="space-between"
        align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} columnGap={6}>
        <Flex as="nav" aria-label="Enlaces del pie de página" align="center" wrap="wrap" columnGap={{ base: 4, md: 5 }}>
          {pathname !== '/' && <Link as={RLink} to="/" {...footerLink}>Inicio</Link>}
          {pathname !== '/que-es-ula' && <Link as={RLink} to="/que-es-ula" {...footerLink}>Qué es Ulà</Link>}
          {canStartOrder && <Link as={RLink} to="/customer/data" {...footerLink}>Hacer pedido</Link>}
          {pathname === '/portfolio'
            ? <SocialContact href={portfolioContactUrl} caption="Contactar" />
            : <Link as={RLink} to="/portfolio" {...footerLink}>Creado por Johel Mora Calderón</Link>}
          <Link as={RLink} to="/auth/sign-in" {...footerLink} aria-label="Acceso administrativo">Acceso</Link>
        </Flex>
        <Flex align="center" wrap="wrap" columnGap={3} color={muted} fontSize="xs" py={2}>
          <Text>© {new Date().getFullYear()} Ulà</Text>
          <Text>Versión {packageInfo.version}</Text>
        </Flex>
      </Flex>
    </Box>
  );
}
