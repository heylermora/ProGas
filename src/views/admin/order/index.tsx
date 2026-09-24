// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Link,
  useColorModeValue,
  SimpleGrid,
  IconButton,
  Spinner,
  Center,
  Input,
  Select,
  Text,
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
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const spinnerColor = useColorModeValue('brand.700', 'white');
  const { refreshKey } = useOrderRefresh();

  const [orders, setorders] = useState<OrderItem[]>([]);
  const [activeStatus, setActiveStatus] = useState<(typeof STATUS_MENU)[number]>('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [filters, setFilters] = useState({ date: '', client: '', status: 'Todos', product: '', payment: '' });

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
    const selectedStatus = filters.status === 'Todos' ? activeStatus : filters.status;
    const date = order.requestDate ? order.requestDate.slice(0, 10) : '';
    const clientTerm = filters.client.trim().toLocaleLowerCase('es');
    return (selectedStatus === 'Todos' || status === selectedStatus)
      && (!filters.date || date === filters.date)
      && (!clientTerm || `${order.client} ${order.clientId || ''}`.toLocaleLowerCase('es').includes(clientTerm))
      && (!filters.product || (order.items || []).some(item => item.gasType === filters.product))
      && (!filters.payment || getPaymentMethods(order).includes(filters.payment));
  }), [orders, activeStatus, filters]);

  // Cuando un card cambia status, actualiza el estado local => el filtro reacciona
  const handleOrderStatusChange = useCallback((id: string, next: string) => {
    setorders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
  }, []);

  const topPt: ResponsiveValue<string> = { base: '180px', md: '80px', xl: '80px' };

  return (
    <Box w="100%" pt={topPt}>
      <Box bg="white" borderRadius="xl" p={4} mb={4} boxShadow="sm">
        <Text fontWeight="800" mb={3}>Filtros de pedidos</Text>
        <SimpleGrid columns={{ base: 1, md: 5 }} gap={3}>
          <Input aria-label="Filtrar por fecha" type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} />
          <Input aria-label="Filtrar por cliente" placeholder="Cliente o cédula" value={filters.client} onChange={e => setFilters(f => ({ ...f, client: e.target.value }))} />
          <Select aria-label="Filtrar por estado" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}><option>Todos</option>{ORDER_STATUSES.map(value => <option key={value}>{value}</option>)}</Select>
          <Select aria-label="Filtrar por producto" value={filters.product} onChange={e => setFilters(f => ({ ...f, product: e.target.value }))}><option value="">Todos los productos</option>{products.map(value => <option key={value}>{value}</option>)}</Select>
          <Select aria-label="Filtrar por método de pago" value={filters.payment} onChange={e => setFilters(f => ({ ...f, payment: e.target.value }))}><option value="">Todos los métodos</option>{['Efectivo', 'Sinpe', 'Tarjeta', 'Otro'].map(value => <option key={value}>{value}</option>)}</Select>
        </SimpleGrid>
      </Box>
      {isError ? (
        <Error />
      ) : isLoading ? (
        <Center>
          <Spinner size="xl" variant={'darkBrand' as any} color={spinnerColor as any} />
        </Center>
      ) : visibleOrders.length === 0 ? (
        <>
          <Flex flexWrap="wrap" align="center" mb="auto">
            {STATUS_MENU.map((status) => (
              <Link
                isTruncated
                key={status}
                color={textColorBrand}
                fontWeight="500"
                onClick={() => handleStatusClick(status)}
                backgroundColor={activeStatus === status ? 'white' : 'transparent'}
                borderRadius="20px"
                p="10px"
                m="5px"
                maxWidth="150px"
                flex="1"
                textAlign="center"
              >
                {status}
              </Link>
            ))}

            <IconButton
              ml="auto"
              mb="20px"
              colorScheme="brand"
              aria-label="Add order"
              icon={<MdAdd />}
              as={RLink as any}
              padding="0px 8px"
              borderRadius="100%"
              to="/admin/order/new"
            />
          </Flex>
          <Empty />
        </>
      ) : (
        <Flex flexDirection="column" w="100%">
          {/* Menu quemado */}
          <Flex flexWrap="wrap" align="center" mb="auto">
            {STATUS_MENU.map((status) => (
              <Link
                isTruncated
                key={status}
                color={textColorBrand}
                fontWeight="500"
                onClick={() => handleStatusClick(status)}
                backgroundColor={activeStatus === status ? 'white' : 'transparent'}
                borderRadius="20px"
                p="10px"
                m="5px"
                maxWidth="150px"
                flex="1"
                textAlign="center"
              >
                {status}
              </Link>
            ))}

            <IconButton
              ml="auto"
              mb="20px"
              colorScheme="brand"
              aria-label="Add order"
              icon={<MdAdd />}
              as={RLink as any}
              padding="0px 8px"
              borderRadius="100%"
              to="/admin/order/new"
            />
          </Flex>

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
