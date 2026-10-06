import React from 'react';
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
import { MdEmail, MdFavorite, MdAccessTime, MdArrowForward } from 'react-icons/md';
import MallPreview from './MallPreview';
import BusinessPromotion from './BusinessPromotion';
import { PublicPage } from './PublicPage';

const acostaBackground = `${process.env.PUBLIC_URL}/acosta-fondo.png`;
const gasMemoLogo = `${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`;
const bmaLogo = `${process.env.PUBLIC_URL}/Banda%20Municipal%20de%20Acosta/logo.png`;
const bmaDonationUrl =
  'https://api.whatsapp.com/send/?phone=50662787984&text=' +
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


const bmaSocialLinks = [
  { ...socialLinks[0], href: 'https://www.facebook.com/BandaMunicipaldeAcosta/' },
  { ...socialLinks[1], href: 'https://www.instagram.com/bandamunicipaldeacosta' },
  { ...socialLinks[2], href: 'https://wa.me/50662787984' },
  { ...socialLinks[3], href: 'https://www.tiktok.com/@bandamunicipaldeacosta' },
  { ...socialLinks[4], href: 'mailto:bandamunicipalacostacr@gmail.com' },
];


function DonationBanner() {
  const bg = useColorModeValue(
    'linear-gradient(115deg, #FFFCF5 0%, #FFF8E5 60%, #FCE8AB 100%)',
    'linear-gradient(115deg, #141E35 0%, #202B43 60%, #453B26 100%)'
  );
  const border = useColorModeValue('yellow.200', 'whiteAlpha.200');
  const text = useColorModeValue('gray.800', 'whiteAlpha.900');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const accent = useColorModeValue('yellow.800', 'yellow.200');
  const ribbon = useColorModeValue('#DFAE32', '#E8BA50');
  const staff = useColorModeValue('#263B59', '#F5D889');
  const footer = useColorModeValue('rgba(255, 255, 255, .58)', 'rgba(10, 18, 33, .38)');

  return (
    <Box as="section" aria-labelledby="band-support-title" bg={bg} color={text}
      border="1px solid" borderColor={border} borderRadius={{ base: '28px', md: '36px' }}
      position="relative" isolation="isolate" overflow="hidden" boxShadow="0 14px 38px rgba(113, 63, 18, .10)">
      <Box as="svg" aria-hidden="true" focusable="false" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice"
        position="absolute" inset="0" w="100%" h="100%" pointerEvents="none" zIndex={-1}>
        <path d="M900 -100 C790 5 1120 45 1050 145 S1100 305 1300 270" fill="none" stroke={ribbon} strokeWidth="78" opacity=".15" />
        <path d="M1080 -100 C965 0 1270 60 1190 155 S1240 330 1380 300" fill="none" stroke={ribbon} strokeWidth="22" opacity=".28" />
        {[0, 12, 24, 36, 48].map((offset) => (
          <path key={offset} d={`M-50 ${200 + offset} C220 ${110 + offset} 350 ${305 + offset} 680 ${220 + offset} S1030 ${130 + offset} 1270 ${240 + offset}`}
            fill="none" stroke={staff} strokeWidth="1.2" opacity=".07" />
        ))}
        <g fill={staff} opacity=".09" transform="translate(805 165) rotate(-12)">
          <ellipse cx="0" cy="35" rx="10" ry="7" /><path d="M8 35 V-8 H11 V35Z M8 -8 Q35 -5 27 15 Q24 3 8 1Z" />
        </g>
        <circle cx="70" cy="-12" r="68" fill={ribbon} opacity=".12" />
        <circle cx="740" cy="35" r="4" fill={ribbon} opacity=".55" />
        <circle cx="765" cy="48" r="2" fill={staff} opacity=".25" />
      </Box>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 5, lg: 7 }}
        align={{ base: 'stretch', lg: 'center' }} p={{ base: 5, md: 7 }}>
        <Flex align="center" gap={{ base: 4, md: 5 }} flex="1" minW="0">
          <Box flexShrink={0} p="6px" bg="white" borderRadius="20px" transform="rotate(-5deg)"
            boxShadow="0 8px 18px rgba(113,63,18,.16)" border="1px solid" borderColor="yellow.100">
            <Image src={bmaLogo} alt="Banda Municipal de Acosta" objectFit="contain"
              boxSize={{ base: '64px', md: '92px' }} borderRadius="14px" bg="yellow.400" />
          </Box>
          <Stack spacing={2} minW="0">
            <Text color={accent} fontSize="10px" fontWeight="800" letterSpacing=".12em" textTransform="uppercase"
              alignSelf="flex-start" border="1px solid" borderColor={border} borderRadius="full" px={3} py={1} bg={footer}>
              Música que une a Acosta
            </Text>
            <Heading id="band-support-title" fontSize={{ base: 'xl', md: '28px' }} lineHeight="1.2" letterSpacing="-.025em">
              Apoye a nuestra Banda Municipal
            </Heading>
            <Text color={muted} fontSize="sm" lineHeight="1.6" maxW="550px">
              Su aporte contribuye a la formación musical del cantón. Ayude a que la música siga creciendo en nuestra comunidad.
            </Text>
          </Stack>
        </Flex>
        <Stack spacing={2} flexShrink={0} w={{ base: '100%', lg: '240px' }}>
          <Button as="a" href={bmaDonationUrl} target="_blank" rel="noopener noreferrer"
            leftIcon={<MdFavorite />} rightIcon={<MdArrowForward />} minH="48px"
            bg="linear-gradient(110deg, #F8D760, #EFC044)" color="gray.900" fontWeight="800" borderRadius="full" px={6}
            boxShadow="0 6px 18px rgba(184, 125, 15, .20)"
            _hover={{ bg: 'yellow.300', transform: 'translateY(-1px)' }}
            _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.600', outlineOffset: '3px' }}>
            Quiero apoyar
          </Button>
          <Text color={muted} fontSize="xs" textAlign="center">Coordine su aporte por WhatsApp.</Text>
        </Stack>
      </Flex>
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }}
        justify="space-between" gap={3} borderTop="1px solid" borderColor={border} bg={footer} backdropFilter="blur(8px)"
        px={{ base: 5, md: 7 }} py={3}>
        <Text color={muted} fontSize="sm">Conozca la Banda y manténgase en contacto</Text>
        <Flex role="group" aria-label="Redes sociales de Banda Municipal de Acosta" gap={2} flexWrap="wrap">
          {bmaSocialLinks.map((social) => (
            <Tooltip key={social.label} label={social.label === 'Correo' ? 'bandamunicipalacostacr@gmail.com' : social.label} hasArrow>
              <IconButton as={Link} href={social.href} isExternal={!social.href.startsWith('mailto:')}
                aria-label={social.label} icon={<Icon as={social.icon} boxSize="18px" />}
                sx={{ background: social.bg }} color="white" boxSize="44px" minW="44px"
                borderRadius="full" boxShadow="0 3px 8px rgba(0,0,0,.10)"
                _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.08)' }}
                _focusVisible={{ outline: '3px solid', outlineColor: 'yellow.600', outlineOffset: '3px' }} />
            </Tooltip>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}

function SocialLogoHub({ organization = 'Gas Memo', logo = gasMemoLogo, links = socialLinks, background = 'brand.500' }: {
  organization?: string;
  logo?: string;
  links?: typeof socialLinks;
  background?: string;
}) {

  return (
    <Box
      role="group"
      aria-label={`Redes sociales de ${organization}`}
      bg={background}
      borderRadius={{ base: '22px', md: '32px' }}
      p={{ base: '24px', md: '34px' }}
      minW="0" w="100%"
      textAlign="center"
      boxShadow="xl"
      position="relative"
      overflow="visible"
    >
      <Box
        position="relative"
        mx="auto"
        display="block"
        borderRadius="28px"
        p={{ base: '10px', md: '14px' }}
        transition="transform .2s ease, filter .2s ease"
        _hover={{ transform: 'translateY(-3px) scale(1.01)', filter: 'drop-shadow(0 14px 22px rgba(0,0,0,.20))' }}
        _focusVisible={{ outline: '3px solid', outlineColor: 'white', outlineOffset: '6px' }}
      >
        <Image src={logo} alt={organization} maxH={{ base: '130px', md: '170px' }} mx="auto" objectFit="contain" pointerEvents="none" />
      </Box>

      {links.map((social) => (
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
            transition="transform .2s ease, filter .2s ease"
            _hover={{ transform: 'translate3d(0, -4px, 0) scale(1.08)', textDecoration: 'none', filter: 'brightness(1.05)' }}
            _focusVisible={{ outline: '3px solid', outlineColor: 'white', outlineOffset: '3px' }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}

export default function Home() {
  const cardBg = useColorModeValue('rgba(255,255,255,.94)', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const border = useColorModeValue('brand.100', 'whiteAlpha.200');

  return (
    <PublicPage maxW="1200px">
      <Box as="section" aria-labelledby="community-title" position="relative" overflow="hidden"
        borderRadius={{ base: '24px', md: '32px' }} mb={{ base: 6, md: 8 }} bg="#EEF3FF"
        border="1px solid" borderColor="#DDE5F5" boxShadow="0 18px 44px rgba(38,51,105,.08)">
        <Box position="relative" px={{ base: 5, md: 10 }} pt={{ base: 7, md: 12 }} pb={{ base: 4, md: 5 }}>
          <Image src={acostaBackground} alt="" aria-hidden="true" position="absolute" inset="0"
            w="100%" h="100%" objectFit="cover" objectPosition={{ base: '72% center', md: 'center 58%' }} pointerEvents="none" />
          <Box aria-hidden="true" position="absolute" inset="0" pointerEvents="none"
            bg={{ base: 'linear-gradient(90deg, rgba(244,246,255,.94), rgba(244,246,255,.72) 45%, rgba(244,246,255,.08) 90%), linear-gradient(0deg, #EEF3FF, transparent 38%)', md: 'linear-gradient(90deg, rgba(244,246,255,.94), rgba(244,246,255,.6) 40%, transparent 72%), linear-gradient(0deg, #EEF3FF, transparent 30%)' }} />
          <Stack position="relative" spacing={{ base: 3, md: 4 }} color="#172554" maxW={{ base: '76%', md: '52%' }}>
            <Text fontSize={{ base: '10px', md: 'xs' }} fontWeight="800" letterSpacing=".12em" textTransform="uppercase">Comercio local</Text>
            <Heading id="community-title" fontSize={{ base: '32px', sm: '40px', md: '48px', lg: '56px' }} lineHeight="1.1" letterSpacing="-.04em">Lo que busca, en Acosta.</Heading>
            <Text fontSize={{ base: 'sm', md: 'lg' }} lineHeight="1.65" maxW="440px" color="#334155">Productos y servicios de nuestra comunidad, reunidos en un solo lugar.</Text>
            <Button as={RLink} to={{ pathname: '/mall', state: { from: '/', fromLabel: 'Volver al inicio' } }}
              alignSelf="flex-start" rightIcon={<MdArrowForward />} size="lg" minH="50px" mt="2px"
              bg="linear-gradient(115deg, #5930E8, #3520AD)" color="white" px={{ base: 5, md: 7 }}
              borderRadius="full" fontWeight="800" boxShadow="0 8px 22px rgba(70,39,191,.28)"
              _hover={{ bg: '#3520AD', boxShadow: '0 10px 26px rgba(70,39,191,.36)' }}
              _focusVisible={{ outline: '3px solid', outlineColor: 'brand.600', outlineOffset: '4px' }}>
              Ver negocios
            </Button>
          </Stack>
        </Box>
        <MallPreview embedded />
        <BusinessPromotion />
      </Box>
      <Box as="section" aria-labelledby="gas-coming-title" mt={{ base: 6, md: 8 }} mb={{ base: 6, md: 8 }}
        bg={cardBg} border="1px solid" borderColor={border} borderTopWidth="4px" borderTopColor="brand.500" borderRadius={{ base: '24px', md: '28px' }}
        p={{ base: 6, md: 9 }} boxShadow="0 16px 40px rgba(38, 51, 105, .07)">
        <Flex direction={{ base: 'column', lg: 'row' }} align={{ base: 'stretch', lg: 'center' }} gap={{ base: 8, lg: 10 }}>
          <Stack flex="1" spacing={4}>
            <Flex align="center" gap={3} alignSelf="flex-start"
              bg="linear-gradient(110deg, #FFD966, #FFB547)" color="#442400" borderRadius="14px"
              px={{ base: 4, md: 5 }} py={3} border="1px solid" borderColor="#FFE8A3"
              boxShadow="0 8px 24px rgba(245,158,11,.26)">
              <Icon as={MdAccessTime} boxSize={{ base: '22px', md: '26px' }} />
              <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="900" letterSpacing=".06em">PRÓXIMAMENTE</Text>
            </Flex>
            <Text color="brand.500" fontSize="sm" fontWeight="800">GAS MEMO</Text>
            <Heading id="gas-coming-title" fontSize={{ base: '28px', md: '38px' }} lineHeight="1.15" letterSpacing="-.03em">Pedidos en línea</Heading>
            <Text color={muted} maxW="560px" lineHeight="1.7">Este servicio aún no está disponible. Consulte las novedades en nuestras redes.</Text>
          </Stack>
          <Stack spacing={4} w={{ base: '100%', lg: '320px' }} flexShrink={0}>
            <SocialLogoHub />
          </Stack>
        </Flex>
      </Box>
      <DonationBanner />
      <Box h={{ base: '14px', md: '18px' }} />
    </PublicPage>
  );
}
