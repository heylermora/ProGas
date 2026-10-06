import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';
import { MdArrowForward, MdStorefront } from 'react-icons/md';

const promotionMessage = 'Hola, Gas Memo. Tengo un negocio en Acosta y quiero promocionarlo en su directorio. ¿Me pueden compartir qué incluye la publicación, los costos y cómo participar?';
const promotionUrl = `https://wa.me/50683978524?text=${encodeURIComponent(promotionMessage)}`;

export default function BusinessPromotion() {
  return (
    <Box as="section" aria-labelledby="business-promotion-title" position="relative" overflow="hidden"
      bg="linear-gradient(120deg, #201748, #342267 65%, #49348A)" color="white"
      borderRadius={{ base: '24px', md: '32px' }} mb={{ base: 6, md: 8 }} p={{ base: 5, md: 8 }}>
      <Box aria-hidden="true" position="absolute" top="-100px" right="-80px" boxSize="300px"
        border="40px solid" borderColor="whiteAlpha.100" borderRadius="full" pointerEvents="none" />
      <Flex position="relative" direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, lg: 10 }} align="center">
        <Stack flex="1" spacing={4} minW="0" w="100%">
          <Text color="#DFC9FF" fontSize="xs" fontWeight="800" letterSpacing=".12em" textTransform="uppercase">Para negocios de Acosta</Text>
          <Heading id="business-promotion-title" fontSize={{ base: '28px', md: '36px' }} lineHeight="1.15" letterSpacing="-.03em" maxW="600px">
            Su negocio también puede estar aquí.
          </Heading>
          <Text color="#EEE8FA" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.7" maxW="570px">
            Presente sus productos o servicios y facilite que las personas conozcan su negocio y encuentren cómo contactarlo.
          </Text>
          <Flex gap={2} flexWrap="wrap">
            {['Su imagen', 'Su oferta', 'Sus contactos'].map((benefit) => (
              <Text key={benefit} fontSize="xs" color="#EEE8FA" border="1px solid" borderColor="whiteAlpha.300" borderRadius="full" px={3} py={1}>{benefit}</Text>
            ))}
          </Flex>
          <Stack spacing={2} align={{ base: 'stretch', md: 'flex-start' }} pt={1}>
            <Button as="a" href={promotionUrl} target="_blank" rel="noopener noreferrer"
              leftIcon={<FaWhatsapp />} rightIcon={<MdArrowForward />} bg="#E4F6B8" color="#20320F"
              fontWeight="800" borderRadius="full" minH="50px" h="auto" py={3} px={{ base: 4, md: 6 }}
              whiteSpace="normal" textAlign="center" lineHeight="1.4" maxW="100%"
              _hover={{ bg: '#D4EE99', transform: 'translateY(-1px)' }}
              _focusVisible={{ outline: '3px solid', outlineColor: '#E4F6B8', outlineOffset: '4px' }}>
              Quiero promocionar mi negocio
            </Button>
            <Text color="#D8CDEB" fontSize="xs">Converse con Gas Memo por WhatsApp sobre opciones y costos.</Text>
          </Stack>
        </Stack>
        <Box as="figure" m={0} w={{ base: '100%', lg: '280px' }} maxW="340px" flexShrink={0}>
          <Text as="figcaption" textAlign="center" color="#DFC9FF" fontSize="xs" mb={3}>Así podría verse su negocio · Ejemplo ilustrativo</Text>
          <Box bg="#FFFCF7" color="#222137" borderRadius="22px" p={3} boxShadow="0 16px 32px rgba(0,0,0,.2)">
            <Flex aria-hidden="true" bg="linear-gradient(135deg, #F6DCB8, #EAC0B2 55%, #D8CCE9)" h="110px"
              borderRadius="14px" align="center" justify="center" position="relative" overflow="hidden">
              <Box position="absolute" boxSize="100px" border="18px solid" borderColor="whiteAlpha.500" borderRadius="full" top="-45px" right="-20px" />
              <Icon as={MdStorefront} boxSize="58px" color="#664C70" />
            </Flex>
            <Stack spacing={2} p={3} pb={2}>
              <Text color="#715780" fontSize="10px" fontWeight="800" letterSpacing=".08em" textTransform="uppercase">Productos o servicios</Text>
              <Text fontSize="xl" fontWeight="800">Su negocio</Text>
              <Text color="#655F70" fontSize="sm" lineHeight="1.6">Una breve presentación de lo que ofrece, con su imagen y sus formas de contacto.</Text>
              <Flex align="center" gap={2} color="#365928" bg="#EDF4E8" borderRadius="full" px={3} py={2} alignSelf="flex-start">
                <Icon as={FaWhatsapp} /><Text fontSize="xs" fontWeight="700">Su contacto directo</Text>
              </Flex>
            </Stack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
