// @ts-nocheck
import React from 'react';
import { Box, Button, Flex, Heading, HStack, Image, Link, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import SponsorStrip from './SponsorStrip';
import { PublicPage } from './PublicPage';

const gasMemoLogo = `${process.env.PUBLIC_URL}/Gas%20Memo/Positive.png`;

export default function Home() {
  return (
    <PublicPage maxW="1200px">
      <SponsorStrip type="VIP" max={2} />
      <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} gap={{ base: '20px', md: '24px' }} my={{ base: '28px', md: '40px' }}>
        <Stack spacing={{ base: '10px', md: '12px' }} maxW={{ base: '100%', lg: '680px' }}>
          <Text color="brand.500" fontWeight="900" letterSpacing="wide">GAS MEMO</Text>
          <Heading fontSize={{ base: '34px', md: '48px', xl: '56px' }} lineHeight="1.05">Pedí tu gas en minutos.</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize={{ base: 'md', md: 'lg' }}>Tu pedido fácil, rápido y sin llamadas.</Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing="12px" pt="12px" w={{ base: '100%', sm: 'auto' }}>
            <Button as={RLink} to="/customer/data" colorScheme="brand" size="lg" w={{ base: '100%', sm: 'auto' }}>Hacer pedido</Button>
            <Button as={RLink} to="/customer/view-order" variant="outline" size="lg" w={{ base: '100%', sm: 'auto' }}>Ver pedido</Button>
          </Stack>
        </Stack>
        <Box bg="brand.500" borderRadius={{ base: '22px', md: '32px' }} p={{ base: '24px', md: '34px' }} minW={{ base: '100%', lg: '320px' }} textAlign="center" boxShadow="xl">
          <Image src={gasMemoLogo} alt="Gas Memo" maxH={{ base: '130px', md: '170px' }} mx="auto" objectFit="contain" />
        </Box>
      </Flex>
      <HStack spacing={{ base: '10px', md: '18px' }} mb={{ base: '28px', md: '36px' }} flexWrap="wrap">
        <Text fontWeight="700" w={{ base: '100%', sm: 'auto' }}>Redes sociales:</Text>
        <Link color="brand.500" href="https://facebook.com" isExternal>Facebook</Link>
        <Link color="brand.500" href="https://instagram.com" isExternal>Instagram</Link>
        <Link color="brand.500" href="https://wa.me/50600000000" isExternal>WhatsApp</Link>
      </HStack>
      <SponsorStrip type="VIP" max={2} />
    </PublicPage>
  );
}
