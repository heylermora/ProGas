import React from 'react';
import { Box, Flex, Icon, IconButton, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink, useHistory, useLocation } from 'react-router-dom';
import { MdHome } from 'react-icons/md';
import BackButton from 'components/button/BackButton';

type NavigationState = { from?: string; fromLabel?: string } | null | undefined;

const backDestination = (pathname: string, state: NavigationState) => {
  if (pathname === '/customer/data') return { to: '/', label: 'Volver al inicio' };
  if (pathname === '/customer/info') return { to: '/customer/data', label: 'Volver a verificación' };
  if (pathname === '/customer/products') return { to: '/customer/info', label: 'Volver al cliente' };
  if (pathname === '/mall') return { to: state?.from || '/', label: state?.fromLabel || 'Salir del centro comercial' };
  return null;
};

export default function PublicHeader({ onBack, backLabel }: { onBack?: () => void; backLabel?: string }) {
  const history = useHistory();
  const location = useLocation();
  const origin = new URLSearchParams(location.search).get('desde');
  const state = (location.state as NavigationState) || (['/portfolio', '/customer/data', '/customer/info', '/customer/products'].includes(origin) ? { from: origin } : undefined);
  const navigation = backDestination(location.pathname, state);
  const bg = useColorModeValue('rgba(255,255,255,.92)', 'rgba(10,18,45,.92)');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const muted = useColorModeValue('gray.600', 'gray.300');

  return (
    <Flex as="header" position="sticky" top="8px" zIndex={30} mb={{ base: '18px', md: '24px' }} minH="58px" px={{ base: '10px', md: '14px' }} py="8px" align="center" justify="space-between" gap="10px" border="1px solid" borderColor={borderColor} borderRadius="20px" bg={bg} boxShadow="0 12px 28px rgba(15,23,42,.10)" backdropFilter="blur(14px)">
      <Flex align="center" gap="9px" minW="0">
        {onBack || (navigation && (location.pathname !== '/mall' || navigation.to !== '/')) ? (
          <BackButton aria-label={backLabel || "Volver"} size="sm" minW="0" px={{ base: '9px', md: '12px' }} onClick={onBack || (() => location.pathname === '/mall' && history.action === 'PUSH' ? history.goBack() : history.replace(navigation.to))}>
            <Text noOfLines={1}>{backLabel || 'Volver'}</Text>
          </BackButton>
        ) : (
          <Flex as={location.pathname === '/' ? RLink : undefined} to={location.pathname === '/' ? '/' : undefined} align="center" gap="9px" color="inherit" _hover={{ textDecoration: 'none' }}>
            <Flex w="38px" h="38px" flex="0 0 auto" borderRadius="13px" bg="brand.500" color="white" align="center" justify="center" fontWeight="900">GM</Flex>
            <Box display={{ base: 'none', sm: 'block' }}><Text fontWeight="900" lineHeight="1">Gas Memo</Text><Text mt="3px" color={muted} fontSize="10px">Pedidos y comercios locales</Text></Box>
          </Flex>
        )}
      </Flex>

      <Flex align="center" gap="6px" flexShrink={0}>
        {location.pathname !== '/' && <IconButton as={RLink} to="/" aria-label="Ir al inicio" icon={<Icon as={MdHome} boxSize="20px" />} variant="ghost" size="sm" borderRadius="full" />}
      </Flex>
    </Flex>
  );
}
