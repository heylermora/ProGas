import { Box, Button, Flex, Heading, Icon, Image, Link, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect } from 'react';
import { MdArrowForward, MdExplore, MdStorefront } from 'react-icons/md';
import { Link as RLink } from 'react-router-dom';
import { PublicPage } from './PublicPage';

const heritageSource = 'https://revistacienciassociales.ucr.ac.cr/html/04-SYLVESTER190/04-SYLVESTER190.html';

const photos = [
  {
    file: 'san-ignacio',
    title: 'San Ignacio',
    description: 'Vista de San Ignacio de Acosta, con la iglesia entre las montañas',
    source: 'San_Ignacio_de_Acosta._Costa_Rica.jpg',
    license: '4.0',
  },
  {
    file: 'palmichal',
    title: 'Palmichal',
    description: 'Plantación de café en una ladera verde de Palmichal de Acosta',
    source: 'Plantaci%C3%B3n_de_caf%C3%A9_en_Palmichal_de_Acosta._Costa_Rica.JPG',
    license: '3.0',
  },
  {
    file: 'sabanillas',
    title: 'Sabanillas',
    description: 'Montañas de Sabanillas de Acosta bajo un cielo azul',
    source: 'Monta%C3%B1as_de_Sabanillas_de_Acosta%2C_Costa_Rica.JPG',
    license: '3.0',
  },
];

function AcostaPhoto({ photo, featured = false }: { photo: typeof photos[number]; featured?: boolean }) {
  const captionBg = useColorModeValue('brand.100', 'navy.800');
  return (
    <Flex as="figure" direction="column" overflow="hidden" bg={captionBg} borderRadius={featured ? undefined : '20px'}>
      <Box position="relative" isolation="isolate" flex="1"
        minH={featured ? { base: '190px', md: '300px' } : { base: '190px', md: '220px' }}>
        <Image src={`${process.env.PUBLIC_URL}/ula/acosta/${photo.file}.webp`} alt={photo.description}
          loading={featured ? 'eager' : 'lazy'} position="absolute" inset={0} w="100%" h="100%"
          objectFit="cover" objectPosition={featured ? '55% 62%' : 'center'} />
        <Box aria-hidden="true" pointerEvents="none" position="absolute" inset={0}
          bg="brand.500" opacity={0.24} mixBlendMode="multiply" />
      </Box>
      <Flex as="figcaption" align="center" justify="space-between" wrap="wrap" gap={2} px={4} py={3}>
        <Text fontSize="sm" fontWeight="700">{photo.title}</Text>
        <Text fontSize="xs">
          <Link href={`https://commons.wikimedia.org/wiki/File:${photo.source}`} isExternal textDecoration="underline">Rodtico21</Link>
          {' · '}
          <Link href={`https://creativecommons.org/licenses/by-sa/${photo.license}/`} isExternal textDecoration="underline">CC BY-SA {photo.license}</Link>
          {' · Recorte y tinte violeta'}
        </Text>
      </Flex>
    </Flex>
  );
}

export default function AboutUla() {
  const surface = useColorModeValue('white', 'navy.800');
  const ink = useColorModeValue('navy.900', 'white');
  const muted = useColorModeValue('gray.700', 'gray.200');
  const border = useColorModeValue('brand.100', 'whiteAlpha.200');
  const accent = useColorModeValue('brand.600', 'brand.100');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Qué es Ulà | Negocios de Acosta y alrededores';
    return () => { document.title = previousTitle; };
  }, []);

  return <PublicPage maxW="1100px">
    <Stack as="main" spacing={{ base: 7, md: 10 }} color={ink}>
      <SimpleGrid as="section" aria-labelledby="about-title" columns={{ base: 1, md: 2 }}
        borderWidth="1px" borderColor={border} borderRadius={{ base: '24px', md: '32px' }} overflow="hidden" bg={surface}>
        <Stack spacing={4} px={{ base: 6, md: 9 }} py={{ base: 7, md: 11 }} justify="center">
          <Flex boxSize="46px" borderRadius="14px" bg="brand.100" align="center" justify="center">
            <Image src={`${process.env.PUBLIC_URL}/ula/isotipo.png`} alt="" h="30px" w="auto" />
          </Flex>
          <Heading as="h1" id="about-title" fontSize={{ base: '36px', md: '52px' }} letterSpacing="-.04em" lineHeight="1.05">Qué es Ulà</Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color={muted} lineHeight="1.65">
            Ulà es un centro comercial virtual para descubrir productos y servicios de comercios de Acosta y alrededores y contactar directamente a los negocios.
          </Text>
          <Button as={RLink} to="/mall" alignSelf="flex-start" colorScheme="brand" minH="44px" rightIcon={<MdArrowForward />}>Explorar comercios</Button>
        </Stack>
        <AcostaPhoto photo={photos[0]} featured />
      </SimpleGrid>

      <Box as="section" aria-labelledby="about-origin" px={{ base: 1, md: 3 }}>
        <Heading as="h2" id="about-origin" fontSize={{ base: '26px', md: '34px' }} mb={3}>Una mano que siempre da</Heading>
        <Stack spacing={3} color={muted} maxW="74ch" lineHeight="1.65">
          <Text>Ulà nació en Acosta, donde dar una mano puede ser tan sencillo como recomendar un comercio vecino. El proyecto recoge esa costumbre para dar visibilidad a quienes emprenden y acercar sus servicios a la comunidad.</Text>
          <Text>Ulà significa «mano» en bribri. El nombre se inspira en <Box as="i">ulàpeitök</Box>, una práctica bribri de ayuda mutua y trabajo colectivo.</Text>
          <Link href={heritageSource} isExternal alignSelf="flex-start" color={accent} textDecoration="underline" fontSize="sm">Leer sobre ulàpeitök en la Revista de Ciencias Sociales de la UCR</Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="about-photos">
        <Heading as="h2" id="about-photos" fontSize={{ base: '26px', md: '34px' }} mb={4}>Paisajes de Acosta</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {photos.slice(1).map(photo => <AcostaPhoto key={photo.file} photo={photo} />)}
        </SimpleGrid>
      </Box>

      <Box as="section" aria-labelledby="about-participate">
        <Heading as="h2" id="about-participate" fontSize={{ base: '26px', md: '34px' }} mb={4}>Cómo participar</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Stack as="article" spacing={3} bg={surface} borderWidth="1px" borderColor={border} borderRadius="20px" p={{ base: 5, md: 6 }}>
            <Icon as={MdExplore} color={accent} boxSize={6} aria-hidden="true" />
            <Heading as="h3" fontSize="xl">Encuentre lo que necesita</Heading>
            <Text color={muted} lineHeight="1.6">Explore el mapa o busque por nombre en la vista sencilla. Abra la ficha de un comercio para consultar sus datos y medios de contacto.</Text>
          </Stack>
          <Stack as="article" spacing={3} bg={surface} borderWidth="1px" borderColor={border} borderRadius="20px" p={{ base: 5, md: 6 }}>
            <Icon as={MdStorefront} color={accent} boxSize={6} aria-hidden="true" />
            <Heading as="h3" fontSize="xl">Dé a conocer su negocio</Heading>
            <Text color={muted} lineHeight="1.6">Si tiene un comercio en Acosta o alrededores, puede solicitar que se publique su ficha en el directorio. Revisaremos la solicitud antes de publicarla.</Text>
            <Link as={RLink} to="/promocionar-negocio" alignSelf="flex-start" color={accent} fontWeight="700" textDecoration="underline">Quiero promocionar mi negocio</Link>
          </Stack>
        </SimpleGrid>
      </Box>
    </Stack>
  </PublicPage>;
}
