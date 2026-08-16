// @ts-nocheck
import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdSearch, MdShoppingBag } from 'react-icons/md';
import orderService from 'services/OrderService';
import { PublicCard, PublicPage } from './PublicPage';
import MallPreview from './MallPreview';
import { onlyDigits } from 'utils/phone';

const statusColor = (status = '') => {
  if (status === 'Completado') return 'green';
  if (status === 'En proceso') return 'orange';
  return 'blue';
};

const formatDate = (value?: string) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function ViewOrder() {
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const term = search.trim().toUpperCase();
    if (!term) {
      setMessage('Ingresá el código que recibiste al confirmar o el teléfono del pedido.');
      return;
    }

    setMessage('');
    setOrders([]);
    setHasSearched(true);
    setIsLoading(true);
    try {
      const phone = onlyDigits(term);
      const results = await orderService.getAll(['orderCode', 'phone'], [term, phone || term]);
      setOrders(results || []);
    } catch {
      setMessage('No pudimos consultar los pedidos en este momento. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicPage title="Consultá tu pedido" description="Revisá el estado y el resumen de tu compra con el código del pedido o el teléfono usado al solicitarlo." maxW="760px">
      <PublicCard>
        <Stack spacing="20px">
          <Box>
            <Heading fontSize={{ base: 'xl', md: '2xl' }}>Buscá tu pedido</Heading>
            <Text mt="5px" color="gray.500" fontSize="sm">El código tiene 6 caracteres y aparece al finalizar el pedido.</Text>
          </Box>
          <Box as="form" onSubmit={handleSearch}>
            <FormControl isRequired>
              <FormLabel>Código de pedido o teléfono</FormLabel>
              <Flex gap="10px" direction={{ base: 'column', sm: 'row' }}>
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej. AB12CD o 8888-8888" autoComplete="tel" />
                <Button type="submit" colorScheme="brand" leftIcon={<MdSearch />} isLoading={isLoading} loadingText="Buscando" flexShrink={0}>Consultar</Button>
              </Flex>
              <FormHelperText>No necesitás iniciar sesión.</FormHelperText>
            </FormControl>
          </Box>
          {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
          {!isLoading && hasSearched && !message && !orders.length && (
            <Alert status="info" borderRadius="12px"><AlertIcon />No encontramos pedidos con ese dato. Verificá que esté escrito correctamente.</Alert>
          )}
          {orders.map((order) => (
            <Box key={order.id} border="1px solid" borderColor={borderColor} bg={cardBg} borderRadius="18px" p={{ base: '14px', md: '18px' }}>
              <Stack spacing="13px">
                <Flex justify="space-between" align="flex-start" gap="10px">
                  <Box><Text color="gray.500" fontSize="xs" fontWeight="800">CÓDIGO DEL PEDIDO</Text><Heading fontSize="xl">{order.orderCode || 'Sin código'}</Heading></Box>
                  <Badge colorScheme={statusColor(order.status)} borderRadius="full" px="10px" py="5px">{order.status || 'Nuevo'}</Badge>
                </Flex>
                <Text color="gray.500" fontSize="sm">Solicitado: {formatDate(order.requestDate)}</Text>
                <Divider />
                <Stack spacing="8px">
                  {(order.items || []).map((item, index) => (
                    <Flex key={`${item.productId || item.gasType}-${index}`} justify="space-between" gap="12px">
                      <Flex gap="8px" align="center"><MdShoppingBag /><Text fontWeight="700">{item.quantity || 1} × {item.gasType || 'Producto'}</Text></Flex>
                      <Text>₡{Number((item.price || 0) * (item.quantity || 0)).toLocaleString('es-CR')}</Text>
                    </Flex>
                  ))}
                </Stack>
                <Divider />
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="8px">
                  <Box><Text color="gray.500" fontSize="xs">Entrega</Text><Text fontWeight="700">{order.location?.address || 'Por coordinar'}</Text></Box>
                  <Box textAlign={{ base: 'left', sm: 'right' }}><Text color="gray.500" fontSize="xs">Total</Text><Text fontWeight="900" fontSize="lg">₡{Number(order.totalAmount || 0).toLocaleString('es-CR')}</Text></Box>
                </SimpleGrid>
              </Stack>
            </Box>
          ))}
        </Stack>
      </PublicCard>
      <MallPreview compact />
    </PublicPage>
  );
}
