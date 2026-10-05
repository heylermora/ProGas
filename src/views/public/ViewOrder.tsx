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
import { MdCheckCircle, MdContentCopy, MdLocalShipping, MdPayment, MdSchedule, MdSearch, MdShoppingBag } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import orderService from 'services/OrderService';
import { PublicCard, PublicPage } from './PublicPage';
import MallPreview from './MallPreview';
import type { OrderItem } from 'interfaces/OrderItem';
import { getPublicOrderStatus } from 'utils/order';
import Form from 'components/form/Form';

const statusColor = (status = '') => {
  if (status === 'Entregado' || status === 'Pagado') return 'green';
  if (status === 'En ruta') return 'orange';
  if (status === 'Cancelado') return 'red';
  return 'blue';
};

const formatDate = (value?: string) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const TRACKED_STATUSES = ['Pendiente', 'En ruta', 'Entregado', 'Pagado'] as const;
const STATUS_ICON = {
  Pendiente: MdSchedule,
  'En ruta': MdLocalShipping,
  Entregado: MdCheckCircle,
  Pagado: MdPayment,
};
const STATUS_DESCRIPTION: Record<string, string> = {
  Pendiente: 'Recibimos su solicitud y estamos preparando el pedido.',
  'En ruta': 'Su pedido salió y va camino a la ubicación indicada.',
  Entregado: 'El pedido fue entregado; queda confirmar el pago.',
  Pagado: 'El pago fue registrado correctamente.',
  Cancelado: 'Este pedido fue cancelado. Escríbanos si necesita ayuda.',
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
      setMessage('Ingrese el código que recibió al confirmar el pedido.');
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
      setMessage('No pudimos consultar los pedidos en este momento. Revise su conexión e intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicPage title="Consulte su pedido" description="Revise el estado y el resumen de su compra con el código entregado al confirmar." maxW="760px">
      <PublicCard>
        <Stack spacing="20px">
          <Box>
            <Heading fontSize={{ base: 'xl', md: '2xl' }}>Busque su pedido</Heading>
            <Text mt="5px" color="gray.500" fontSize="sm">El código tiene 12 caracteres y aparece al finalizar el pedido.</Text>
          </Box>
          <Form onFormSubmit={handleSearch}>
            <FormControl isRequired>
              <FormLabel>Código de pedido</FormLabel>
              <Flex gap="10px" direction={{ base: 'column', sm: 'row' }}>
                <Input value={search} onChange={(event) => setSearch(event.target.value.toUpperCase())} placeholder="Ej. AB12CD34EF56" autoComplete="off" maxLength={12} />
                <Button type="submit" colorScheme="brand" leftIcon={<MdSearch />} isLoading={isLoading} loadingText="Buscando" flexShrink={0}>Consultar</Button>
              </Flex>
              <FormHelperText>No necesita iniciar sesión.</FormHelperText>
            </FormControl>
          </Form>
          {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
          {!isLoading && hasSearched && !message && !orders.length && (
            <Alert status="info" borderRadius="12px"><AlertIcon />No encontramos pedidos con ese dato. Verifique que esté escrito correctamente.</Alert>
          )}
          {orders.map((order) => (
            <Box key={order.id} border="1px solid" borderColor={borderColor} bg={cardBg} borderRadius="18px" p={{ base: '14px', md: '18px' }}>
              <Stack spacing="13px">
                {(() => { const currentStatus = getPublicOrderStatus(order.status); const currentIndex = TRACKED_STATUSES.indexOf(currentStatus as typeof TRACKED_STATUSES[number]); const CurrentStatusIcon = currentStatus === 'Cancelado' ? MdCheckCircle : STATUS_ICON[currentStatus]; return <>
                <Flex justify="space-between" align="flex-start" gap="10px">
                  <Box><Text color="gray.500" fontSize="xs" fontWeight="800">CÓDIGO DEL PEDIDO</Text><Heading fontSize="xl">{order.orderCode || 'Sin código'}</Heading></Box>
                  <Button size="sm" variant="outline" leftIcon={<MdContentCopy />} onClick={() => navigator.clipboard.writeText(order.orderCode || '')}>Copiar código</Button>
                </Flex>
                <Box p={{ base: 4, md: 5 }} bg="white" borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
                  <Flex justify="space-between" gap={1} mb={5}>{TRACKED_STATUSES.map((step, index) => { const StepIcon = STATUS_ICON[step]; const reached = currentStatus !== 'Cancelado' && index <= currentIndex; const active = index === currentIndex; return <Flex key={step} flex="1" align="flex-start"><Stack spacing="5px" align="center" minW={{ base: '42px', md: '64px' }}><Flex boxSize={active ? '38px' : '32px'} borderRadius="full" bg={reached ? 'brand.500' : 'gray.100'} color={reached ? 'white' : 'gray.400'} align="center" justify="center" boxShadow={active ? '0 0 0 5px rgba(66, 42, 255, .14)' : undefined}><StepIcon size={active ? 21 : 18} /></Flex><Text fontSize="xs" fontWeight={active ? '900' : '700'} color={active ? 'brand.600' : 'gray.500'} textAlign="center">{step}</Text></Stack><Box h="3px" flex="1" mt={active ? '18px' : '15px'} bg={currentStatus !== 'Cancelado' && index < currentIndex ? 'brand.500' : 'gray.200'} display={index === TRACKED_STATUSES.length - 1 ? 'none' : 'block'} /></Flex>; })}</Flex>
                  <Badge display="inline-flex" alignItems="center" gap="6px" colorScheme={statusColor(currentStatus)} borderRadius="full" px="12px" py="6px"><CurrentStatusIcon />{currentStatus}</Badge>
                  <Heading fontSize={{ base: 'lg', md: 'xl' }} mt={3}>{currentStatus === 'Cancelado' ? 'Pedido cancelado' : `Su pedido está ${currentStatus.toLocaleLowerCase('es')}`}</Heading>
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
