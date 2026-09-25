import React from 'react';
import { Badge, Box, Button, Flex, Heading, Icon, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdArrowBack, MdDevices, MdEmail, MdRocketLaunch, MdStorefront, MdSupportAgent } from 'react-icons/md';
import { PublicPage } from './PublicPage';

const services = [
  { icon: MdDevices, title: 'Sitios y aplicaciones web', text: 'Experiencias rápidas, claras y adaptadas a celulares, tabletas y computadoras.' },
  { icon: MdStorefront, title: 'Presencia para negocios', text: 'Catálogos, pedidos y espacios digitales pensados para acercar emprendimientos a sus clientes.' },
  { icon: MdSupportAgent, title: 'Acompañamiento cercano', text: 'Soluciones prácticas, soporte y mejoras continuas según las necesidades de cada proyecto.' },
];

export default function Portfolio() {
  const surface = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const border = useColorModeValue('brand.100', 'whiteAlpha.200');

  return (
    <PublicPage maxW="1100px">
      <Stack spacing={{ base: '18px', md: '28px' }}>
        <Box position="relative" overflow="hidden" borderRadius={{ base: '24px', md: '34px' }} bg="linear-gradient(135deg, #11047A 0%, #422AFB 56%, #7551FF 100%)" color="white" px={{ base: '22px', md: '52px' }} py={{ base: '34px', md: '58px' }}>
          <Box position="absolute" right={{ base: '-65px', md: '4%' }} top={{ base: '-30px', md: '18px' }} w={{ base: '180px', md: '260px' }} h={{ base: '180px', md: '260px' }} borderRadius="full" bg="whiteAlpha.100" />
          <Stack position="relative" spacing="14px" maxW="700px">
            <Badge alignSelf="flex-start" px="12px" py="5px" borderRadius="full" bg="whiteAlpha.200" color="white" letterSpacing=".08em">DESARROLLO DIGITAL DESDE ACOSTA</Badge>
            <Heading as="h1" fontSize={{ base: '36px', md: '58px' }} lineHeight="1.02" letterSpacing="-.04em">Johel Mora</Heading>
            <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="700">Ideas locales convertidas en experiencias digitales útiles.</Text>
            <Text color="whiteAlpha.800" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.7" maxW="620px">Ayudo a emprendimientos y organizaciones a presentar sus servicios, simplificar sus procesos y conectar con más personas mediante tecnología fácil de usar.</Text>
            <Flex direction={{ base: 'column', sm: 'row' }} gap="10px" pt="8px">
              <Button as="a" href="mailto:johelmora@gmail.com?subject=Quiero%20impulsar%20mi%20emprendimiento" leftIcon={<MdEmail />} bg="white" color="brand.800" borderRadius="full" size="lg" _hover={{ bg: 'brand.100', transform: 'translateY(-2px)' }}>Conversemos sobre tu idea</Button>
              <Button as={RLink} to="/" leftIcon={<MdArrowBack />} variant="ghost" color="white" borderRadius="full" size="lg" _hover={{ bg: 'whiteAlpha.200' }}>Volver a Gas Memo</Button>
            </Flex>
          </Stack>
        </Box>

        <Box as="section" aria-labelledby="services-title">
          <Text color="brand.500" fontWeight="900" fontSize="sm" letterSpacing=".1em">SERVICIOS</Text>
          <Heading id="services-title" mt="3px" fontSize={{ base: '26px', md: '36px' }}>Una solución clara para hacer crecer tu proyecto</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="14px" mt="18px">
            {services.map((service) => (
              <Stack key={service.title} bg={surface} border="1px solid" borderColor={border} borderRadius="22px" p={{ base: '20px', md: '24px' }} spacing="12px" boxShadow="0 10px 28px rgba(66,42,251,.07)">
                <Flex w="48px" h="48px" borderRadius="16px" bg="brand.100" color="brand.600" align="center" justify="center"><Icon as={service.icon} boxSize="25px" /></Flex>
                <Heading fontSize="lg">{service.title}</Heading>
                <Text color={muted} fontSize="sm" lineHeight="1.65">{service.text}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Box>

        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="18px" bg={surface} border="1px solid" borderColor={border} borderRadius="24px" p={{ base: '22px', md: '30px' }}>
          <Flex gap="14px" align="center"><Flex w="50px" h="50px" borderRadius="full" bg="brand.500" color="white" align="center" justify="center"><Icon as={MdRocketLaunch} boxSize="26px" /></Flex><Box><Heading fontSize={{ base: 'xl', md: '2xl' }}>¿Tenés una idea?</Heading><Text color={muted}>Démosle forma y pongámosla al alcance de tus clientes.</Text></Box></Flex>
          <Button as="a" href="mailto:johelmora@gmail.com?subject=Nuevo%20proyecto" colorScheme="brand" borderRadius="full" size="lg" flexShrink={0} w={{ base: '100%', md: 'auto' }}>Iniciar un proyecto</Button>
        </Flex>
      </Stack>
    </PublicPage>
  );
}
