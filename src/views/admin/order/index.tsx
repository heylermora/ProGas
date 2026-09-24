// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Spinner,
  Center,
  Input,
  Select,
  Text,
  Button,
  Badge,
} from '@chakra-ui/react';
import type { ResponsiveValue } from '@chakra-ui/react';
import { Link as RLink, useParams, useHistory } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';

import ItemCard from 'components/card/ItemCard';
import Empty from 'components/exceptions/Empty';
import Error from 'components/exceptions/Error';
import orderService from 'services/OrderService';
import OrderItem from 'interfaces/OrderItem';
import { useOrderRefresh } from 'contexts/OrderRefreshContext';
import { getPaymentMethods, normalizeOrderStatus, ORDER_STATUSES } from 'utils/order';

const STATUS_MENU = [...ORDER_STATUSES, 'Todos'] as const;

export default function Index() {
  const params = useParams<{ search?: string }>();
  const search = params.search ?? null;

  const history = useHistory();
  const spinnerColor = useColorModeValue('brand.700', 'white');
  const { refreshKey } = useOrderRefresh();

  const [orders, setorders] = useState<OrderItem[]>([]);
  const [activeStatus, setActiveStatus] = useState<(typeof STATUS_MENU)[number]>('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [filters, setFilters] = useState({ date: '', client: '', product: '', payment: '' });

  // Fetch: NO filtra por status (solo por search si aplica)
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    const promise: Promise<OrderItem[]> =
      search === null || search === ':search'
        ? orderService.getAll()
        : orderService.getAll(['client', 'orderCode'], [search, search]);

    promise
      .then((ordersData: OrderItem[]) => {
        setorders(ordersData);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, [search, refreshKey]);

  const handleStatusClick = useCallback(
    (status: (typeof STATUS_MENU)[number]) => {
      if (status === 'Todos') {
        history.replace('/admin/order/index');
      }
      setActiveStatus(status);
    },
    [history]
  );

  // Filtro en frontend (quemado)
  const products = useMemo(() => Array.from(new Set(orders.flatMap(order => order.items || []).map(item => item.gasType).filter(Boolean))).sort(), [orders]);
  const visibleOrders = useMemo(() => orders.filter(order => {
    const status = normalizeOrderStatus(order.status);
    const date = order.requestDate ? order.requestDate.slice(0, 10) : '';
    const clientTerm = filters.client.trim().toLocaleLowerCase('es');
    return (activeStatus === 'Todos' || status === activeStatus)
      && (!filters.date || date === filters.date)
      && (!clientTerm || `${order.client} ${order.clientId || ''}`.toLocaleLowerCase('es').includes(clientTerm))
      && (!filters.product || (order.items || []).some(item => item.gasType === filters.product))
      && (!filters.payment || getPaymentMethods(order).includes(filters.payment));
  }), [orders, activeStatus, filters]);

  const statusCounts = useMemo(() => orders.reduce<Record<string, number>>((counts, order) => {
    const status = normalizeOrderStatus(order.status);
    counts[status] = (counts[status] || 0) + 1;
    counts.Todos += 1;
    return counts;
  }, { Todos: 0 }), [orders]);

  const hasAdvancedFilters = Boolean(filters.date || filters.client || filters.product || filters.payment);
  const clearFilters = () => setFilters({ date: '', client: '', product: '', payment: '' });

  // Cuando un card cambia status, actualiza el estado local => el filtro reacciona
  const handleOrderStatusChange = useCallback((id: string, next: string) => {
    setorders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
  }, []);

  const topPt: ResponsiveValue<string> = { base: '180px', md: '80px', xl: '80px' };

  return (
    <Box w="100%" pt={topPt}>
      <Box bg="white" borderRadius="xl" p={4} mb={4} boxShadow="sm">
        <Text fontWeight="800" mb={3}>Filtros de pedidos</Text>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={3}>
          <Input aria-label="Filtrar por fecha" type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
          <Input aria-label="Filtrar por cliente" placeholder="Cliente o cédula" value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))} />
          <Select aria-label="Filtrar por producto" value={filters.product} onChange={e => setFilters(f => ({ ...f, product: e.target.value }))}><option value="">Todos los productos</option>{products.map(value => <option key={value}>{value}</option>)}</Select>
          <Select aria-label="Filtrar por método de pago" value={filters.payment} onChange={e => setFilters(f => ({ ...f, payment: e.target.value }))}><option value="">Todos los métodos</option>{['Efectivo', 'Sinpe', 'Tarjeta', 'Otro'].map(value => <option key={value}>{value}</option>)}</Select>
        </SimpleGrid>
        {hasAdvancedFilters && <Flex justify="flex-end" mt={3}><Button size="sm" variant="ghost" onClick={clearFilters}>Limpiar filtros</Button></Flex>}
      </Box>
      <Flex flexWrap="wrap" align="center" gap={2} mb={5}>
        {STATUS_MENU.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={activeStatus === status ? 'solid' : 'outline'}
            colorScheme={activeStatus === status ? 'brand' : 'gray'}
            borderRadius="full"
            onClick={() => handleStatusClick(status)}
          >
            {status} <Badge ml={2} borderRadius="full" colorScheme={activeStatus === status ? 'whiteAlpha' : 'gray'}>{statusCounts[status] || 0}</Badge>
          </Button>
        ))}
        <IconButton ml="auto" colorScheme="brand" aria-label="Crear pedido" icon={<MdAdd />} as={RLink as any} borderRadius="full" to="/admin/order/new" />
      </Flex>
      {isError ? (
        <Error />
      ) : isLoading ? (
        <Center>
          <Spinner size="xl" variant={'darkBrand' as any} color={spinnerColor as any} />
        </Center>
      ) : visibleOrders.length === 0 ? (
        <Empty message="No hay pedidos que coincidan con los filtros seleccionados." />
      ) : (
        <Flex flexDirection="column" w="100%">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="5px">
            {visibleOrders.map((order) => {
              const itemsCount = order.items ? order.items.length : 0;
              const totalAmount = order.items
                ? order.items.reduce(
                    (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
                    0
                  )
                : 0;

              return (
                <ItemCard
                  {...order}
                  key={order.id}
                  id={order.id}
                  client={order.client}
                  clientId={order.clientId}
                  orderCode={order.orderCode}
                  status={order.status}
                  requestDate={order.requestDate}
                  itemsCount={itemsCount}
                  totalAmount={totalAmount}
                  location={order.location || { address: '' }}
                  clientCed={(order as any).clientId || (order as any).cedula || undefined}
                  onStatusChange={(id: string, next: string) => handleOrderStatusChange(id, next)}
                />
              );
            })}
          </SimpleGrid>
        </Flex>
      )}
    </Box>
  );
}
