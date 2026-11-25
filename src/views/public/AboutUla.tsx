import { Box, Button, Flex, Heading, Icon, Image, Link, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect } from 'react';
import { MdArrowForward, MdExplore, MdStorefront } from 'react-icons/md';
import { Link as RLink } from 'react-router-dom';
import { PublicPage } from './PublicPage';

const heritageSource = 'https://revistacienciassociales.ucr.ac.cr/html/04-SYLVESTER190/04-SYLVESTER190.html';

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
        <Box position="relative" minH={{ base: '190px', md: '340px' }}>
          <Image src={`${process.env.PUBLIC_URL}/ula/acosta.webp`} alt="Ilustración de la iglesia y las montañas de Acosta"
            position="absolute" inset={0} w="100%" h="100%" objectFit="cover" objectPosition="70% center" />
        </Box>
      </SimpleGrid>

      <Box as="section" aria-labelledby="about-origin" px={{ base: 1, md: 3 }}>
        <Heading as="h2" id="about-origin" fontSize={{ base: '26px', md: '34px' }} mb={3}>Una mano que siempre da</Heading>
        <Stack spacing={3} color={muted} maxW="74ch" lineHeight="1.65">
          <Text>Ulà nació en Acosta, donde dar una mano puede ser tan sencillo como recomendar un comercio vecino. El proyecto recoge esa costumbre para dar visibilidad a quienes emprenden y acercar sus servicios a la comunidad.</Text>
          <Text>Ulà significa «mano» en bribri. El nombre se inspira en <Box as="i">ulàpeitök</Box>, una práctica bribri de ayuda mutua y trabajo colectivo.</Text>
          <Link href={heritageSource} isExternal alignSelf="flex-start" color={accent} textDecoration="underline" fontSize="sm">Leer sobre ulàpeitök en la Revista de Ciencias Sociales de la UCR</Link>
        </Stack>
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
