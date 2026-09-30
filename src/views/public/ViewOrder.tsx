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
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdContentCopy, MdSearch, MdShoppingBag } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import orderService from 'services/OrderService';
import { PublicCard, PublicPage } from './PublicPage';
import MallPreview from './MallPreview';
import type { OrderItem } from 'interfaces/OrderItem';
import { normalizeOrderStatus } from 'utils/order';

const statusColor = (status = '') => {
  if (status === 'Entregado' || status === 'Pagado') return 'green';
  if (status === 'En ruta') return 'orange';
  if (status === 'Liquidado') return 'purple';
  if (status === 'Cancelado') return 'red';
  return 'blue';
};

const formatDate = (value?: string) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const TRACKED_STATUSES = ['Pendiente', 'En ruta', 'Entregado', 'Pagado', 'Liquidado'] as const;
const STATUS_DESCRIPTION: Record<string, string> = {
  Pendiente: 'Recibimos tu solicitud y estamos preparando el pedido.',
  'En ruta': 'Tu pedido salió y va camino a la ubicación indicada.',
  Entregado: 'El pedido fue entregado; queda confirmar el pago.',
  Pagado: 'El pago fue registrado correctamente.',
  Liquidado: 'El pedido ya fue incluido en el cierre de turno.',
  Cancelado: 'Este pedido fue cancelado. Escribinos si necesitás ayuda.',
};

export default function ViewOrder() {
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [message, setMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const term = search.trim().toUpperCase();
    if (!term) {
      setMessage('Ingresá el código que recibiste al confirmar el pedido.');
      return;
    }

    setMessage('');
    setOrders([]);
    setHasSearched(true);
    setIsLoading(true);
    try {
      const results = await orderService.getByCode(term);
      setOrders(results || []);
    } catch {
      setMessage('No pudimos consultar los pedidos en este momento. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicPage title="Consultá tu pedido" description="Revisá el estado y el resumen de tu compra con el código entregado al confirmar." maxW="760px">
      <PublicCard>
        <Stack spacing="20px">
          <Box>
            <Heading fontSize={{ base: 'xl', md: '2xl' }}>Buscá tu pedido</Heading>
            <Text mt="5px" color="gray.500" fontSize="sm">El código tiene 12 caracteres y aparece al finalizar el pedido.</Text>
          </Box>
          <Box as="form" onSubmit={handleSearch}>
            <FormControl isRequired>
              <FormLabel>Código de pedido</FormLabel>
              <Flex gap="10px" direction={{ base: 'column', sm: 'row' }}>
                <Input value={search} onChange={(event) => setSearch(event.target.value.toUpperCase())} placeholder="Ej. AB12CD34EF56" autoComplete="off" maxLength={12} />
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
                {(() => { const currentStatus = normalizeOrderStatus(order.status); const currentIndex = TRACKED_STATUSES.indexOf(currentStatus as typeof TRACKED_STATUSES[number]); return <>
                <Flex justify="space-between" align="flex-start" gap="10px">
                  <Box><Text color="gray.500" fontSize="xs" fontWeight="800">CÓDIGO DEL PEDIDO</Text><Heading fontSize="xl">{order.orderCode || 'Sin código'}</Heading></Box>
                  <Button size="sm" variant="outline" leftIcon={<MdContentCopy />} onClick={() => navigator.clipboard.writeText(order.orderCode || '')}>Copiar código</Button>
                </Flex>
                <Box p={{ base: 4, md: 5 }} bg="white" borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                  <Flex justify="space-between" gap={1} mb={4}>{TRACKED_STATUSES.map((step, index) => <Flex key={step} flex="1" align="center"><Box boxSize={index === currentIndex ? '18px' : '12px'} borderRadius="full" bg={index <= currentIndex ? 'brand.500' : 'gray.200'} boxShadow={index === currentIndex ? '0 0 0 5px rgba(66, 42, 255, .14)' : undefined} /><Box h="3px" flex="1" bg={index < currentIndex ? 'brand.500' : 'gray.200'} display={index === TRACKED_STATUSES.length - 1 ? 'none' : 'block'} /></Flex>)}</Flex>
                  <Badge colorScheme={statusColor(currentStatus)} borderRadius="full" px="12px" py="6px">{currentStatus}</Badge>
                  <Heading fontSize={{ base: 'lg', md: 'xl' }} mt={3}>{currentStatus === 'Cancelado' ? 'Pedido cancelado' : `Tu pedido está ${currentStatus.toLocaleLowerCase('es')}`}</Heading>
                  <Text color="gray.600" mt={2}>{STATUS_DESCRIPTION[currentStatus]}</Text>
                </Box>
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
                <Box textAlign="right"><Text color="gray.500" fontSize="xs">Total</Text><Text fontWeight="900" fontSize="lg">₡{Number(order.totalAmount || 0).toLocaleString('es-CR')}</Text></Box>
                <Button as="a" href={`https://wa.me/50683978524?text=${encodeURIComponent(`Hola, necesito más información sobre mi pedido ${order.orderCode}.`)}`} target="_blank" rel="noopener noreferrer" colorScheme="green" leftIcon={<FaWhatsapp />}>Consultar por WhatsApp</Button>
                </>; })()}
              </Stack>
            </Box>
          ))}
        </Stack>
      </PublicCard>
      <MallPreview compact />
    </PublicPage>
  );
}
