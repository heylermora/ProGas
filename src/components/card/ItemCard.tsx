import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Tooltip,
  Tag,
  Menu as ChakraMenu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, CheckIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
import { formatValue } from 'utils/formatValue';
import OrderService from 'services/OrderService';
import { OrderItem } from 'interfaces/OrderItem';

import PaymentModal from 'components/modal/PaymentModal';

type OrderStatus = 'Nuevo' | 'En proceso' | 'Completado';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'Nuevo', label: 'Nuevo' },
  { value: 'En proceso', label: 'En proceso' },
  { value: 'Completado', label: 'Completado' },
];

function normalizeStatus(value: string | undefined | null): OrderStatus {
  if (value === 'Nuevo' || value === 'En proceso' || value === 'Completado') return value;
  return 'Nuevo';
}

function getStatusProps(status: OrderStatus) {
  switch (status) {
    case 'Nuevo':
      return { colorScheme: 'blue', icon: '📌' };
    case 'En proceso':
      return { colorScheme: 'yellow', icon: '⏳' };
    case 'Completado':
      return { colorScheme: 'green', icon: '✅' };
  }
}

function formatCRDate(value?: string | Date | null) {
  if (!value) return 'N/A';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ItemCard(props: any /* OrderItem */) {
  const { id, client, clientId, orderCode, status, requestDate, totalAmount, location, onStatusChange } = props;

  const [localStatus, setLocalStatus] = useState<OrderStatus>(() => normalizeStatus(status));
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const { isOpen: isPayOpen, onOpen: onPayOpen, onClose: onPayClose } = useDisclosure();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    setLocalStatus(normalizeStatus(status));
  }, [status]);

  const cardBg = useColorModeValue('white', 'navy.800');
  const cardBorder = useColorModeValue('gray.100', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const secondaryText = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const totalBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const totalColor = useColorModeValue('brand.600', 'brand.300');
  const highlightColor = useColorModeValue('brand.500', 'white');
  const chipBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const chipBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const hoverBorderColor = useColorModeValue('blackAlpha.300', 'whiteAlpha.400');

  const statusMeta = getStatusProps(localStatus);
  const formattedDate = formatCRDate(requestDate);
  const formattedTotal = `₡ ${formatValue(String(totalAmount ?? 0))}`;

  const mapsUrl = useMemo(() => {
    const { lat, lng } = location ?? {};
    return typeof lat === 'number' && typeof lng === 'number'
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;
  }, [location?.lat, location?.lng]);

  const message = useMemo(() => {
    const lines = [
      'Hola 👋',
      'Te comparto el pedido para entregar:',
      '',
      `👤 Cliente: ${client || '-'}`,
      `🪪 Cédula: ${clientId || '-'}`,
    ];
    if (location?.address) lines.push(`📍 Dirección: ${location.address}`);
    if (mapsUrl) lines.push(`🗺️ Google Maps:\n${mapsUrl}`);
    lines.push('', `💵 Total a cobrar: ${formattedTotal}`, '', 'Por favor entregar y confirmar 👍');
    return lines.join('\n');
  }, [client, clientId, location?.address, mapsUrl, formattedTotal]);

  // ✅ Guarda status + (opcional) pagos
  const updateOrder = async (next: OrderStatus, paymentPayload?: any) => {
    if (next === localStatus && !paymentPayload) return;

    const prev = localStatus;
    setLocalStatus(next);
    setIsSavingStatus(true);

    try {
      const { onStatusChange: _cb, ...orderPayload } = props;

      // payments actuales de la orden (si existen)
      const currentPayments = Array.isArray(orderPayload.payments) ? orderPayload.payments : [];

      // payments del modal
      const newPayments = paymentPayload?.payments ?? [];

      const editedOrder: any = {
        ...orderPayload,
        status: next,
      };

      if (paymentPayload) {
        editedOrder.payments = [...currentPayments, ...newPayments];
        editedOrder.totalPaid = paymentPayload.totalPaid;
        editedOrder.totalToPay = paymentPayload.totalToPay;
        editedOrder.change = paymentPayload.change;
        editedOrder.pending = paymentPayload.pending;
        editedOrder.paidAt = paymentPayload.paidAt;
        editedOrder.paymentNote = paymentPayload.note;
      }

      await OrderService.edit(id, editedOrder);
      onStatusChange?.(id, next);
    } catch (err) {
      setLocalStatus(prev);
      console.error('Error updating order:', err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const onPickStatus = (next: OrderStatus) => {
    if (isSavingStatus) return;
    if (next === localStatus) return;

    if (next === 'Completado') {
      setPendingStatus(next);
      onPayOpen();
      return;
    }

    updateOrder(next);
  };

  // ✅ ahora recibe payload del modal
  const handlePaymentSaved = async (paymentPayload: any) => {
    onPayClose();

    if (pendingStatus) {
      const toApply = pendingStatus;
      setPendingStatus(null);
      await updateOrder(toApply, paymentPayload); // 👈 guarda pagos en la orden
    }
  };

  const handlePaymentClose = () => {
    setPendingStatus(null);
    onPayClose();
  };

  return (
    <>
      <Card
        p={4}
        h="100%"
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        borderTopWidth="3px"
        borderTopColor={`${statusMeta.colorScheme}.400`}
        transition="all .18s ease"
        _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'blackAlpha.200' }}
      >
        <Flex direction="column" h="100%" gap={3}>
          <Flex justify="space-between" align="center" gap={3}>
            <Flex align="center" gap={2} minW={0}>
              <Tag size="sm" borderRadius="full" colorScheme={statusMeta.colorScheme} fontWeight="800" px={2.5} flexShrink={0}>
                <Box as="span" mr={1}>{statusMeta.icon}</Box>
                {localStatus}
              </Tag>

              <Text fontSize="xs" color={secondaryText} noOfLines={1}>
                {formattedDate}
              </Text>
            </Flex>

            <Menu id={id} name={client} text={message} />
          </Flex>

          <Box minW={0}>
            <Tooltip label={client} hasArrow>
              <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="500" color={textColor} isTruncated lineHeight="1.15">
                {client}
              </Text>
            </Tooltip>
          </Box>

          <Flex direction="column" gap={2}>
            <Flex wrap="wrap" gap={2} align="center">
              <Tag size="sm" borderRadius="full" bg={chipBg} borderWidth="1px" borderColor={chipBorder} px={3} py={1} fontWeight="900" color={highlightColor} maxW="180px">
                <Text isTruncated w="100%">{orderCode}</Text>
              </Tag>

              <Tag size="sm" borderRadius="full" bg={chipBg} borderWidth="1px" borderColor={chipBorder} px={3} py={1} fontWeight="800" color={textColor}>
                <Box as="span" color={secondaryText} fontWeight="700">Cédula:</Box>
                <Box as="span" ml={2}>{clientId || '-'}</Box>
              </Tag>
            </Flex>

            {!!location?.address && (
              <Flex align="flex-start" gap={2} px={3} py={2} bg={chipBg} borderWidth="1px" borderColor={chipBorder} borderRadius="xl" color={secondaryText}>
                <Text fontSize="xs" noOfLines={2} lineHeight="1.3">📍 {location.address}</Text>
              </Flex>
            )}
          </Flex>

          <Flex align="center" justify="space-between" mt={1}>
            <Text fontSize="xs" color={secondaryText} fontWeight="700">Total</Text>

            <Box bg={totalBg} borderRadius="full" px={4} py={2} borderWidth="1px" borderColor={chipBorder} maxW="70%">
              <Text color={totalColor} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900" lineHeight="1" noOfLines={1} textAlign="right">
                {formattedTotal}
              </Text>
            </Box>
          </Flex>

          <Box w="100%">
            <ChakraMenu placement="bottom-start">
              <MenuButton
                as={Button}
                size="sm"
                h="34px"
                w="100%"
                borderRadius="full"
                fontWeight="800"
                rightIcon={<ChevronDownIcon />}
                bg={chipBg}
                borderWidth="1px"
                borderColor={chipBorder}
                isLoading={isSavingStatus}
                loadingText="Actualizando..."
                _hover={{ borderColor: hoverBorderColor }}
                _active={{ transform: 'translateY(1px)' }}
              >
                {statusMeta.icon} {localStatus}
              </MenuButton>

              <MenuList p={1} borderRadius="xl" borderColor={cardBorder}>
                {STATUS_OPTIONS.map(o => (
                  <MenuItem
                    key={o.value}
                    borderRadius="full"
                    fontWeight={o.value === localStatus ? '800' : '700'}
                    onClick={() => onPickStatus(o.value)}
                    isDisabled={isSavingStatus}
                  >
                    <HStack w="100%" justify="space-between">
                      <Text>{getStatusProps(o.value).icon} {o.label}</Text>
                      {o.value === localStatus && <Icon as={CheckIcon} />}
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </ChakraMenu>
          </Box>

          <Box mt="auto">
            <Link to={`/admin/order/details/${id}`}>
              <Button variant="darkBrand" w="100%" h="36px" borderRadius="full" px={6} fontSize="sm" fontWeight="900" color="white">
                Ver detalles
              </Button>
            </Link>
          </Box>
        </Flex>
      </Card>

      <PaymentModal
        id={id}
        title="Añadir pago"
        totalToPay={totalAmount}
        isOpen={isPayOpen}
        onClose={handlePaymentClose}
        onSaved={handlePaymentSaved} // 👈 ahora recibe payload
      />
    </>
  );
}