// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Tag,
  HStack,
} from '@chakra-ui/react';
import type { ResponsiveValue } from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';

import orderService from 'services/OrderService';
import OrderItem from 'interfaces/OrderItem';
import Error from 'components/exceptions/Error';
import Empty from 'components/exceptions/Empty';
import { useOrderRefresh } from 'contexts/OrderRefreshContext';

type PaymentMethod = 'Efectivo' | 'Sinpe' | 'Tarjeta' | 'Otro';

type DailySummary = {
  date: string;
  totalOrders: number;
  totalAmount: number;

  completedOrders: number;
  completedAmount: number;

  pendingOrders: number;
  pendingAmount: number;

  byMethod: Record<PaymentMethod, number>;
  changeTotal: number;
};

const METHODS: PaymentMethod[] = ['Efectivo', 'Sinpe', 'Tarjeta', 'Otro'];

export default function Balance() {
  const spinnerColor = useColorModeValue('brand.700', 'white');
  const cardBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.800', 'white');
  const subtleText = useColorModeValue('secondaryGray.500', 'secondaryGray.400');
  const methodCardBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  const { refreshKey } = useOrderRefresh();

  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const topPt: ResponsiveValue<string> = { base: '180px', md: '80px', xl: '80px' };

  const getLocalDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isCompletedStatus = (status?: string | null) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === 'completado' || s === 'completada' || s === 'completed';
  };

  const normalizeMethod = (m: any): PaymentMethod => {
    const v = String(m || '').toLowerCase().trim();
    if (v === 'efectivo' || v === 'cash') return 'Efectivo';
    if (v === 'sinpe') return 'Sinpe';
    if (v === 'tarjeta' || v === 'card') return 'Tarjeta';
    return 'Otro';
  };

  const extractPayments = (order: any) => {
    if (Array.isArray(order?.payments)) return order.payments;
    if (Array.isArray(order?.paymentMethods)) return order.paymentMethods;
    if (Array.isArray(order?.paymentDetails)) return order.paymentDetails;
    return [];
  };

  const getOrderTotalAmount = (order: any) => {
    if (typeof order?.totalAmount === 'number') return order.totalAmount;
    if (typeof order?.totalToPay === 'number') return order.totalToPay;
    return order?.items
      ? order.items.reduce(
          (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
          0
        )
      : 0;
  };

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    orderService
      .getAll()
      .then((ordersData: OrderItem[]) => {
        if (!ordersData || ordersData.length === 0) {
          setSummaries([]);
          return;
        }

        const mapByDate: Record<string, DailySummary> = {};

        ordersData.forEach((order: any) => {
          if (!order.requestDate) return;

          const dateObj = new Date(order.requestDate);
          if (isNaN(dateObj.getTime())) return;

          const key = getLocalDateKey(dateObj);
          const totalAmount = getOrderTotalAmount(order);
          const completed = isCompletedStatus(order.status);

          if (!mapByDate[key]) {
            mapByDate[key] = {
              date: key,
              totalOrders: 0,
              totalAmount: 0,
              completedOrders: 0,
              completedAmount: 0,
              pendingOrders: 0,
              pendingAmount: 0,
              byMethod: { Efectivo: 0, Sinpe: 0, Tarjeta: 0, Otro: 0 },
              changeTotal: 0,
            };
          }

          const summary = mapByDate[key];

          summary.totalOrders += 1;
          summary.totalAmount += totalAmount;

          if (completed) {
            summary.completedOrders += 1;
            summary.completedAmount += totalAmount;

            const payments = extractPayments(order);
            payments.forEach((p: any) => {
              const method = normalizeMethod(p?.method);
              const amount = Number(p?.amount || 0) || 0;
              summary.byMethod[method] += amount;
            });

            const change = Number(order?.change || 0) || 0;
            summary.changeTotal += change;
          } else {
            summary.pendingOrders += 1;
            summary.pendingAmount += totalAmount;
          }
        });

        const summariesArray = Object.values(mapByDate).sort(
          (a, b) => (a.date < b.date ? 1 : -1)
        );

        setSummaries(summariesArray);
      })
      .catch((error) => {
        console.error('Error fetching daily balance:', error);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refreshKey]);

  const formatCRC = (n: number) => `₡${Number(n || 0).toLocaleString('es-CR')}`;

  return (
    <Box w="100%" pt={topPt}>
      {isError ? (
        <Error />
      ) : isLoading ? (
        <Center>
          <Spinner size="xl" variant={'darkBrand' as any} color={spinnerColor as any} />
        </Center>
      ) : summaries.length === 0 ? (
        <>
          <IconButton
            ml="auto"
            mb="20px"
            colorScheme="brand"
            aria-label="Add order"
            icon={<MdAdd />}
            as={RLink as any}
            padding="0px 8px"
            borderRadius="100%"
            to="/order/new"
          />
          <Empty message="Aún no hay datos para generar el balance diario." />
        </>
      ) : (
        <Flex flexDirection="column" w="100%" maxW="1100px" mx="auto">
          <Flex align="center" mb="16px">
            <Box>
              <Text fontSize="sm" color={subtleText}>
                El monto “Completado” es el total vendido. El desglose se basa en los pagos registrados.
              </Text>
            </Box>
            <IconButton
              ml="auto"
              colorScheme="brand"
              aria-label="Add order"
              icon={<MdAdd />}
              as={RLink as any}
              padding="0px 8px"
              borderRadius="100%"
              to="/order/new"
            />
          </Flex>

          <Accordion allowMultiple defaultIndex={[0]}>
            {summaries.map((summary) => {
              const prettyDate = new Date(summary.date).toLocaleDateString('es-CR', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              });

              const hasPending = summary.pendingAmount > 0;
              const methodsTotal = METHODS.reduce(
                (sum, m) => sum + (summary.byMethod[m] || 0),
                0
              );
              const diffVsCompleted = summary.completedAmount - methodsTotal;

              return (
                <AccordionItem key={summary.date} border="none" mb="8px">
                  <Box bg={cardBg} borderRadius="16px" boxShadow="sm" overflow="hidden">
                    <AccordionButton px="16px" py="10px">
                      <Flex w="100%" align="left" gap="2px">
                        <Box>
                          <Text fontSize="md" fontWeight="600" color={textColor}>
                            {prettyDate}
                          </Text>
                          <Text fontSize="xs" color={subtleText}>
                            {summary.totalOrders} orden
                            {summary.totalOrders !== 1 ? 'es' : ''} · Monto total:{' '}
                            {formatCRC(summary.totalAmount)}
                          </Text>
                        </Box>

                        <Box ml="auto" textAlign="right" mr="8px">
                          <Text fontSize="xs" color={subtleText}>
                            Completado
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {formatCRC(summary.completedAmount)}
                          </Text>
                        </Box>

                        <AccordionIcon />
                      </Flex>
                    </AccordionButton>

                    <AccordionPanel px="16px" pb="12px">
                      <Divider my="6px" />

                      <Flex direction={{ base: 'column', md: 'row' }} gap="12px">
                        <Box flex="1">
                          <Stat>
                            <StatLabel fontSize="xs">Órdenes</StatLabel>
                            <StatNumber fontSize="lg">{summary.totalOrders}</StatNumber>
                            <StatHelpText fontSize="xs">
                              Completadas: {summary.completedOrders} · Pendientes:{' '}
                              {summary.pendingOrders}
                            </StatHelpText>
                          </Stat>
                        </Box>

                        <Box flex="1">
                          <Stat>
                            <StatLabel fontSize="xs">Monto vendido</StatLabel>
                            <StatNumber fontSize="lg">
                              {formatCRC(summary.completedAmount)}
                            </StatNumber>
                            <StatHelpText fontSize="xs">
                              Total de órdenes completadas
                            </StatHelpText>
                          </Stat>
                        </Box>

                        <Box flex="1">
                          <Stat>
                            <StatLabel fontSize="xs">Vuelto del día</StatLabel>
                            <StatNumber fontSize="md">
                              {formatCRC(summary.changeTotal)}
                            </StatNumber>
                            <StatHelpText fontSize="xs">
                              Suma de vueltos registrados
                            </StatHelpText>
                          </Stat>
                        </Box>

                        {hasPending && (
                          <Box flex="1">
                            <Stat>
                              <StatLabel fontSize="xs">Monto pendiente</StatLabel>
                              <StatNumber fontSize="md">
                                {formatCRC(summary.pendingAmount)}
                              </StatNumber>
                              <StatHelpText fontSize="xs">
                                {summary.pendingOrders} orden
                                {summary.pendingOrders !== 1 ? 'es' : ''} sin completar
                              </StatHelpText>
                            </Stat>
                          </Box>
                        )}
                      </Flex>

                      <Divider my="10px" />

                      <Flex align="center" justify="space-between" mb="8px">
                        <Text fontSize="sm" fontWeight="700" color={textColor}>
                          Desglose por método de pago
                        </Text>

                        {Math.abs(diffVsCompleted) > 0.01 && (
                          <Tag size="sm" borderRadius="full" colorScheme="yellow">
                            Órdenes completadas sin pagos
                          </Tag>
                        )}
                      </Flex>

                      <SimpleGrid columns={{ base: 2, md: 4 }} gap="10px">
                        {METHODS.map((m) => (
                          <Box
                            key={m}
                            p="10px"
                            borderRadius="14px"
                            borderWidth="1px"
                            borderColor={methodCardBorder}
                          >
                            <Text fontSize="xs" color={subtleText} fontWeight="700">
                              {m}
                            </Text>
                            <Text fontSize="md" fontWeight="800" color={textColor}>
                              {formatCRC(summary.byMethod[m] || 0)}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>

                      <HStack justify="space-between" mt="10px">
                        <Text fontSize="xs" color={subtleText}>
                          Total por métodos: {formatCRC(methodsTotal)}
                        </Text>
                        <Text fontSize="xs" color={subtleText}>
                          Diferencia vs vendido: {formatCRC(diffVsCompleted)}
                        </Text>
                      </HStack>
                    </AccordionPanel>
                  </Box>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Flex>
      )}
    </Box>
  );
}