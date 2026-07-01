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
import { MdEmail, MdFavorite } from 'react-icons/md';
import SponsorStrip from './SponsorStrip';
import { PublicPage } from './PublicPage';

const gasMemoLogo = `${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`;
const bmaLogo = `${process.env.PUBLIC_URL}/Banda%20Municipal%20de%20Acosta/Logo.png`;
const bmaDonationUrl =
  'https://api.whatsapp.com/send/?phone=50683978524&text=' +
  encodeURIComponent('Hola, quiero apoyar a la Banda Municipal de Acosta con una donación. ¿Me comparten la información?') +
  '&type=phone_number&app_absent=0';

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


function DonationBanner() {
  const bg = useColorModeValue(
    'linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 48%, #FFF3C4 100%)',
    'linear-gradient(135deg, rgba(113, 63, 18, .45) 0%, rgba(23, 25, 35, .96) 55%, rgba(66, 32, 6, .55) 100%)'
  );

  const borderColor = useColorModeValue('yellow.200', 'yellow.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const logoBg = useColorModeValue('white', 'whiteAlpha.900');

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius={{ base: '20px', md: '28px' }}
      boxShadow="0 18px 45px rgba(0, 0, 0, 0.08)"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 5 }}
      overflow="hidden"
      position="relative"
    >
      <Box
        position="absolute"
        top="-45px"
        right="-45px"
        w="140px"
        h="140px"
        bg="yellow.300"
        opacity="0.22"
        borderRadius="full"
      />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
        gap={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <Flex align="center" gap={{ base: 3, md: 5 }} minW="0">
          <Box
            bg={logoBg}
            border="1px solid"
            borderColor={useColorModeValue('yellow.100', 'yellow.600')}
            borderRadius={{ base: '18px', md: '22px' }}
            boxShadow="sm"
            p={{ base: 2, md: 3 }}
            w={{ base: '78px', md: '104px' }}
            minW={{ base: '78px', md: '104px' }}
            h={{ base: '64px', md: '82px' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src={bmaLogo}
              alt="Banda Municipal de Acosta"
              maxH="100%"
              maxW="100%"
              objectFit="contain"
            />
          </Box>

          <Stack spacing={{ base: 1, md: 2 }} minW="0">
            <Text
              color="yellow.700"
              fontWeight="900"
              fontSize={{ base: 'xs', md: 'sm' }}
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Campaña solidaria
            </Text>

            <Heading
              color={textColor}
              fontSize={{ base: 'xl', md: '3xl' }}
              lineHeight="1.1"
              letterSpacing="-0.03em"
            >
              Apoyá a la Banda Municipal de Acosta
            </Heading>

            <Text
              color={muted}
              fontSize={{ base: 'sm', md: 'md' }}
              maxW="620px"
              lineHeight="1.55"
            >
              Tu donación ayuda a impulsar la música, la formación artística y el talento local.
              Cualquier aporte suma.
            </Text>
          </Stack>
        </Flex>

        <Button
          as="a"
          href={bmaDonationUrl}
          target="_blank"
          rel="noopener noreferrer"
          leftIcon={<MdFavorite />}
          size={{ base: 'md', md: 'lg' }}
          alignSelf={{ base: 'stretch', md: 'center' }}
          flexShrink={0}
          bg="yellow.400"
          color="gray.900"
          fontWeight="900"
          borderRadius="full"
          px={{ base: 6, md: 8 }}
          boxShadow="0 10px 24px rgba(202, 138, 4, 0.28)"
          _hover={{
            bg: 'yellow.300',
            transform: 'translateY(-2px)',
            boxShadow: '0 14px 30px rgba(202, 138, 4, 0.36)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
        >
          Donar ahora
        </Button>
      </Flex>
    </Box>
  );
}

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
      <SponsorStrip type="VIP" max={2} title="Patrocinadores" />
      <Box h={{ base: '10px', md: '14px' }} />
      <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} gap={{ base: '20px', md: '24px' }} my={{ base: '18px', md: '28px' }}>
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
      <DonationBanner />
      <Box h={{ base: '14px', md: '18px' }} />
      <SponsorStrip type="VIP" max={2} offset={2} title="Patrocinadores" />
    </PublicPage>
  );
}
