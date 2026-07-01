// @ts-nocheck
import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import SponsorStrip from './SponsorStrip';
import { PublicPage } from './PublicPage';

const gasMemoLogo = `${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`;

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/gasmemoymandaditos',
    icon: FaFacebookF,
    bg: '#1877F2',
    position: { base: { top: '-10px', left: '16px' }, md: { top: '10px', left: '-12px' } },
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/gasmemo2022?fbclid=IwY2xjawSsA2NleHRuA2FlbQIxMABicmlkETFCaFlvTGI1Uzh6RjRib3Exc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHo1bl06kfyGsphsRCNX3LobPoAtg2XoVSNuYklk43R3Y0DQ7CYlc55Y8BHXO_aem_V-fXi2Lvxja2m-IWN6wAiQ',
    icon: FaInstagram,
    bg: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)',
    position: { base: { top: '-16px', right: '22px' }, md: { top: '-8px', right: '12px' } },
  },
  {
    label: 'WhatsApp',
    href: 'https://api.whatsapp.com/send/?phone=50683978524&text&type=phone_number&app_absent=0&utm_source=ig',
    icon: FaWhatsapp,
    bg: '#25D366',
    position: { base: { bottom: '-12px', left: '20px' }, md: { bottom: '10px', left: '-18px' } },
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@gas.memo',
    icon: FaTiktok,
    bg: '#111111',
    position: { base: { bottom: '-16px', right: '24px' }, md: { bottom: '2px', right: '4px' } },
  },
  {
    label: 'Correo',
    href: 'mailto:facturasgasmemo@gmail.com',
    icon: MdEmail,
    bg: '#F97316',
    position: { base: { bottom: '42px', right: '-10px' }, md: { top: '50%', right: '-28px' } },
  },
];

function SocialLogoHub() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box
      bg="brand.500"
      borderRadius={{ base: '22px', md: '32px' }}
      p={{ base: '24px', md: '34px' }}
      minW={{ base: '100%', lg: '340px' }}
      textAlign="center"
      boxShadow="xl"
      position="relative"
      overflow="visible"
    >
      <Box
        as="button"
        type="button"
        aria-label={isOpen ? 'Ocultar redes sociales de Gas Memo' : 'Mostrar redes sociales de Gas Memo'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        position="relative"
        mx="auto"
        display="block"
        borderRadius="28px"
        p={{ base: '10px', md: '14px' }}
        transition="transform .2s ease, filter .2s ease"
        _hover={{ transform: 'translateY(-3px) scale(1.01)', filter: 'drop-shadow(0 14px 22px rgba(0,0,0,.20))' }}
        _focusVisible={{ outline: '3px solid', outlineColor: 'white', outlineOffset: '6px' }}
      >
        <Image src={gasMemoLogo} alt="Gas Memo" maxH={{ base: '130px', md: '170px' }} mx="auto" objectFit="contain" pointerEvents="none" />
      </Box>

      {socialLinks.map((social, index) => (
        <Tooltip key={social.label} label={social.label} hasArrow placement="top">
          <IconButton
            as={Link}
            href={social.href}
            isExternal={!social.href.startsWith('mailto:')}
            aria-label={social.label}
            icon={<Icon as={social.icon} w="22px" h="22px" />}
            position="absolute"
            {...social.position.base}
            sx={{
              '@media screen and (min-width: 48em)': social.position.md,
              background: social.bg,
            }}
            color="white"
            w={{ base: '50px', md: '56px' }}
            h={{ base: '50px', md: '56px' }}
            minW={{ base: '50px', md: '56px' }}
            borderRadius="full"
            boxShadow="0 18px 30px rgba(15, 23, 42, .28)"
            border="3px solid"
            borderColor="white"
            opacity={isOpen ? 1 : 0}
            visibility={isOpen ? 'visible' : 'hidden'}
            transform={isOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 12px, 0) scale(.65)'}
            transition={`all .28s cubic-bezier(.2,.8,.2,1) ${isOpen ? index * 45 : 0}ms`}
            _hover={{ transform: 'translate3d(0, -4px, 0) scale(1.08)', textDecoration: 'none', filter: 'brightness(1.05)' }}
            _focusVisible={{ outline: '3px solid', outlineColor: 'white', outlineOffset: '3px' }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}

export default function Home() {
  return (
    <PublicPage maxW="1200px">
      <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} gap={{ base: '20px', md: '24px' }} mb={{ base: '18px', md: '28px' }}>
        <Stack spacing={{ base: '10px', md: '12px' }} maxW={{ base: '100%', lg: '680px' }}>
          <Text color="brand.500" fontWeight="900" letterSpacing="wide">GAS MEMO</Text>
          <Heading fontSize={{ base: '34px', md: '48px', xl: '56px' }} lineHeight="1.05">Pedí tu gas en minutos.</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize={{ base: 'md', md: 'lg' }}>Tu pedido fácil, rápido y sin llamadas.</Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing="12px" pt="12px" w={{ base: '100%', sm: 'auto' }}>
            <Button as={RLink} to="/customer/data" colorScheme="brand" size="lg" w={{ base: '100%', sm: 'auto' }}>Hacer pedido</Button>
            <Button as={RLink} to="/customer/view-order" variant="outline" size="lg" w={{ base: '100%', sm: 'auto' }}>Ver pedido</Button>
          </Stack>
        </Stack>
        <SocialLogoHub />
      </Flex>
      <Stack spacing={{ base: '10px', md: '12px' }}>
        <SponsorStrip type="VIP" max={2} title="Patrocinadores" />
        <SponsorStrip type="VIP" max={2} offset={2} />
      </Stack>
    </PublicPage>
  );
}
