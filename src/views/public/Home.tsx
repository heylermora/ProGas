// @ts-nocheck
import React from 'react';
import { Box, Button, Container, Flex, Heading, HStack, Link, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import SponsorStrip from './SponsorStrip';

export default function Home() {
  return (
    <Box bg={useColorModeValue('gray.50', 'navy.900')} minH="100vh" py="32px">
      <Container maxW="1200px">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap="24px" mb="40px">
          <Stack spacing="12px">
            <Text color="brand.500" fontWeight="900" letterSpacing="wide">GAS MEMO</Text>
            <Heading size="2xl">Gas rápido, pedidos simples y patrocinadores locales.</Heading>
            <Text color="gray.600" fontSize="lg">Solicite gas sin crear usuario y apoye negocios aliados de la zona.</Text>
            <HStack pt="12px">
              <Button as={RLink} to="/cliente/datos" colorScheme="brand" size="lg">Hacer pedido</Button>
              <Button as={RLink} to="/cliente/ver-pedido" variant="outline" size="lg">Ver pedido</Button>
            </HStack>
          </Stack>
          <Box bg="brand.500" color="white" borderRadius="32px" p="34px" minW={{ base: '100%', md: '320px' }} textAlign="center" boxShadow="xl">
            <Heading>Gas Memo</Heading>
            <Text mt="10px">Servicio de gas y accesorios</Text>
          </Box>
        </Flex>
        <HStack spacing="18px" mb="36px" flexWrap="wrap">
          <Text fontWeight="700">Redes sociales:</Text>
          <Link color="brand.500" href="https://facebook.com" isExternal>Facebook</Link>
          <Link color="brand.500" href="https://instagram.com" isExternal>Instagram</Link>
          <Link color="brand.500" href="https://wa.me/50600000000" isExternal>WhatsApp</Link>
        </HStack>
        <SponsorStrip type="VIP" max={4} title="Patrocinadores VIP" />
      </Container>
    </Box>
  );
}
