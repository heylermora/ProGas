import { AcostaHorizons, UlaCurve } from 'components/brand/UlaResources';
import { SocialLinksRow, SocialContact } from 'components/social/SocialLink';
import React, { useEffect } from 'react';
import AnalyticsService from 'services/AnalyticsService';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';
import MallPreview from './MallPreview';
import BusinessPromotion from './BusinessPromotion';
import { PublicPage } from './PublicPage';

const acostaBackground = `${process.env.PUBLIC_URL}/ula/acosta.webp`;
const bmaLogo = `${process.env.PUBLIC_URL}/Banda%20Municipal%20de%20Acosta/logo.png`;
const bmaDonationUrl =
  'https://api.whatsapp.com/send/?phone=50662787984&text=' +
  encodeURIComponent('Hola, quiero apoyar a la Banda Municipal de Acosta con una donación. ¿Me comparten la información?') +
  '&type=phone_number&app_absent=0';

const bmaSocialLinks = [
  { href: 'https://www.facebook.com/BandaMunicipaldeAcosta/' },
  { href: 'https://www.instagram.com/bandamunicipaldeacosta' },
  { href: 'https://wa.me/50662787984' },
  { href: 'https://www.tiktok.com/@bandamunicipaldeacosta' },
  { href: 'mailto:bandamunicipalacostacr@gmail.com' },
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
      border="1px solid" borderColor={border} borderRadius={{ base: '24px', md: '30px' }}
      position="relative" isolation="isolate" overflow="hidden" boxShadow="0 14px 38px rgba(113, 63, 18, .10)">
      <Box position="absolute" top="0" left="24px" right="24px" h="2px" bgGradient="linear(to-r, transparent, #E8BA50, transparent)" aria-hidden="true" />
      <Box as="svg" aria-hidden="true" focusable="false" viewBox="0 0 1200 300"  preserveAspectRatio="xMidYMid slice"
        display={{ base: 'none', md: 'block' }} position="absolute" inset="0" w="100%" h="100%" pointerEvents="none" zIndex={-1}>
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
      <Box as="svg" aria-hidden="true" focusable="false" viewBox="0 0 360 430" preserveAspectRatio="none"
        display={{ base: 'block', md: 'none' }} position="absolute" inset="0" w="100%" h="100%" pointerEvents="none" zIndex={-1}>
        <path d="M290 -40 C210 40 360 55 320 130 S340 190 390 210" fill="none" stroke={ribbon} strokeWidth="35" opacity=".18" />
        {[0, 9, 18, 27, 36].map(offset => <path key={offset} d={`M-30 ${270 + offset} C80 ${220 + offset} 180 ${350 + offset} 390 ${270 + offset}`} fill="none" stroke={staff} strokeWidth="1" opacity=".10" />)}
        <g fill={staff} opacity=".13" transform="translate(280 255) rotate(-12)">
          <ellipse cx="0" cy="22" rx="7" ry="5" /><path d="M5 22 V-10 H8 V22Z M5 -10 Q25 -7 19 7 Q17 -2 5 -3Z" />
        </g>
      </Box>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 3, lg: 5 }}
        align={{ base: 'stretch', lg: 'center' }} p={{ base: 4, md: 5 }}>
        <Flex align={{ base: 'flex-start', md: 'center' }} gap={{ base: 3, md: 4 }} flex="1" minW="0">
          <Box flexShrink={0} p="5px" bg="white" borderRadius="18px" transform="rotate(-6deg)"
            boxShadow="0 8px 18px rgba(113,63,18,.16)" border="1px solid" borderColor="yellow.100">
            <Image src={bmaLogo} alt="Banda Municipal de Acosta" objectFit="contain"
              boxSize={{ base: '62px', md: '80px' }} borderRadius="14px" bg="yellow.400" />
          </Box>
          <Stack spacing="5px" minW="0">
            <Text color={accent} fontSize={{ base: '9px', md: '10px' }} fontWeight="800" letterSpacing=".1em" textTransform="uppercase"
              alignSelf="flex-start">
              Música que une a Acosta
            </Text>
            <Heading id="band-support-title" fontSize={{ base: '20px', md: '26px' }} lineHeight="1.2" letterSpacing="-.025em">
              Apoye a nuestra Banda Municipal
            </Heading>
            <Text display={{ base: 'none', md: 'block' }} color={muted} fontSize={{ base: '13px', md: 'sm' }} lineHeight="1.45" maxW="550px">
              Su aporte contribuye a la formación musical del cantón. Ayude a que la música siga creciendo en nuestra comunidad.
            </Text>
          </Stack>
        </Flex>
        <Text display={{ base: 'block', md: 'none' }} color={muted} fontSize={{ base: '13px', md: 'sm' }} lineHeight="1.45">
          Su aporte contribuye a la formación musical del cantón. Ayude a que la música siga creciendo en nuestra comunidad.
        </Text>
        <Box flexShrink={0} w={{ base: '100%', lg: '260px' }} p="8px" borderRadius="16px" bg={footer} border="1px solid" borderColor={border}>
          <SocialContact size="compact" href={bmaDonationUrl} caption="Quiero apoyar" description="Coordine su aporte por WhatsApp." />
        </Box>
      </Flex>
      <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }}
        justify="space-between" gap={{ base: 0, md: 3 }} borderTop="1px solid" borderColor={border} bg={footer} backdropFilter="blur(8px)"
        px={{ base: 4, md: 5 }} py={2}>
        <Text color={muted} fontSize="xs">Conozca la Banda y manténgase en contacto</Text>
        <Box w={{ base: '100%', md: 'auto' }} minW="0" maxW="100%"><SocialLinksRow links={bmaSocialLinks.map(social => social.href)} label="Redes sociales de Banda Municipal de Acosta" size="compact" /></Box>
      </Flex>
    </Box>
  );
}

export default function Home() {
  useEffect(() => { void AnalyticsService.track({ type: 'page_view', source: 'home' }); }, []);

  return (
    <PublicPage maxW="1200px">
      <Box as="section" aria-labelledby="community-title" position="relative" overflow="hidden"
        borderRadius={{ base: '24px', md: '32px' }} mb={{ base: 6, md: 8 }} bg="brand.100"
        border="1px solid" borderColor="brand.100" boxShadow="0 18px 44px rgba(11,20,55,.08)">
        <Box position="relative" px={{ base: 5, md: 12 }} pt={{ base: 6, md: 10 }}
          pb={{ base: '116px', md: 12 }} minH={{ md: '420px' }} display="flex" alignItems="center">
          <Image src={acostaBackground} alt="" aria-hidden="true" position="absolute" inset="0"
            w="100%" h="100%" objectFit="cover" objectPosition={{ base: '76% center', md: 'center 54%' }} pointerEvents="none" />
          <Box aria-hidden="true" position="absolute" inset="0" pointerEvents="none"
            bg={{ base: 'linear-gradient(180deg, rgba(250,250,255,.96) 3%, rgba(248,248,255,.86) 50%, transparent 78%), linear-gradient(0deg, #E8E3FF, transparent 25%)', md: 'linear-gradient(90deg, rgba(250,250,255,.97) 0%, rgba(248,248,255,.85) 30%, transparent 68%), linear-gradient(0deg, #E8E3FF, transparent 18%)' }} />
          <UlaCurve prominent />
          <AcostaHorizons />
          <Stack position="relative" zIndex={2} spacing={{ base: 3, md: 4 }} color="navy.900" maxW={{ base: '340px', md: '440px' }}>
            <Image src={`${process.env.PUBLIC_URL}/ula/logo.png`} alt="" h={{ base: '58px', md: '78px' }} w="auto" alignSelf="flex-start" objectFit="contain" />
            <Heading as="h1" id="community-title" fontSize={{ base: '36px', sm: '44px', lg: '58px' }} fontWeight="700"
              lineHeight="1.02" letterSpacing="-.045em" sx={{ textWrap: 'balance' }}>Una mano que siempre da.</Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.55" maxW="330px">Encuentre productos y servicios de los comercios de Acosta y alrededores.</Text>
            <Flex align="center" wrap="wrap" columnGap={{ base: 2, md: 3 }} rowGap={2}>
              <Button as={RLink} to="/mall"
                onClick={() => { void AnalyticsService.track({ type: 'browse_click', source: 'home' }); }}
                rightIcon={<MdArrowForward aria-hidden="true" />} size="md" fontSize={{ base: "sm", md: "md" }} minH="44px" px={4}
                colorScheme="brand" bg="brand.500" color="white" borderRadius="12px" fontWeight="700"
                _hover={{ bg: 'brand.600' }}
                _focusVisible={{ outline: '3px solid', outlineColor: 'navy.900', outlineOffset: '3px' }}>
                Explorar comercios
              </Button>
              <Button as={RLink} to="/que-es-ula" variant="outline" size="md" fontSize={{ base: "sm", md: "md" }} minH="44px" px={3}
                color="navy.900" borderColor="blackAlpha.300" bg="whiteAlpha.600" borderRadius="12px" fontWeight="600"
                _hover={{ bg: 'brand.100' }}
                _focusVisible={{ outline: '3px solid', outlineColor: 'navy.900', outlineOffset: '3px' }}>
                Qué es Ulà
              </Button>
            </Flex>
          </Stack>
        </Box>
        <MallPreview embedded />
        <BusinessPromotion />
      </Box>
      <DonationBanner />
      <Box h={{ base: '14px', md: '18px' }} />
    </PublicPage>
  );
}
