import { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';

import { Center, Text, useColorModeValue, Flex, Spinner, Box } from '@chakra-ui/react';

import { formatValue } from 'utils/formatValue';
import OrderService from 'services/OrderService';
import { OrderItem, ProductItem } from 'interfaces/OrderItem';
import Error from 'components/exceptions/Error';
import Card from 'components/card/Card';

export default function Details() {
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const spinnerColor = useColorModeValue('brand.700', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const secondaryTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const borderColor = useColorModeValue('secondaryGray.200', 'whiteAlpha.100');
  const totalsBgColor = useColorModeValue('brand.50', 'whiteAlpha.50');
  const itemBgColor = useColorModeValue('gray.50', 'whiteAlpha.50');

  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      OrderService.get(id)
        .then((orderData: OrderItem) => {
          setOrder(orderData);
          setIsError(false);
        })
        .catch((error) => {
          console.error('Error fetching order data:', error);
          setIsError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const calculateTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum: number, item: ProductItem) => sum + item.price * item.quantity, 0);
  };

  const formatCRC = (value: number) => `₡ ${formatValue(value.toString())}`;

  return (
    <>
      {isError ? (
        <Error />
      ) : isLoading ? (
        <Center>
          <Spinner size="xl" variant={'darkBrand' as any} color={spinnerColor as any} />
        </Center>
      ) : order ? (
        <>
          {/* Header de la Factura */}
          <Card p={{ base: 4, md: 6 }} mb={4}>
            <Flex direction="column" gap={4}>
              {/* Título y Código */}
              <Box>
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color={textColor} mb={2}>
                  Detalles de Orden
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={brandStars} fontWeight="600">
                  Código: {order.orderCode}
                </Text>
              </Box>

              {/* Info de Fecha y Estado */}
              <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <Box flex={1}>
                  <Text fontSize="xs" color={secondaryTextColor} fontWeight="600" mb={1}>
                    FECHA
                  </Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="500" color={textColor}>
                    {order.requestDate ? new Date(order.requestDate).toLocaleDateString('es-CR') : 'N/A'}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="xs" color={secondaryTextColor} fontWeight="600" mb={1}>
                    ESTADO
                  </Text>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color={order.status === 'Nuevo' ? 'green.500' : brandStars}
                  >
                    {order.status}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Card>

          {/* Información del Cliente */}
          <Card p={{ base: 4, md: 6 }} mb={4}>
            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="600" color={textColor} mb={3}>
              Información del Cliente
            </Text>

            <Flex direction="column" gap={3}>
              <Box>
                <Text fontSize="xs" color={secondaryTextColor} fontWeight="600" mb={1}>
                  CLIENTE
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="500" color={textColor}>
                  {order.client}
                </Text>
                {order.clientId && (
                  <Text fontSize="xs" color={secondaryTextColor} mt={1}>
                    Cédula: {order.clientId}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="xs" color={secondaryTextColor} fontWeight="600" mb={1}>
                  UBICACIÓN
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="500" color={textColor}>
                  {order.location.address || 'N/A'}
                </Text>
              </Box>

              {order.comment && (
                <Box>
                  <Text fontSize="xs" color={secondaryTextColor} fontWeight="600" mb={1}>
                    COMENTARIOS
                  </Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }} color={textColor}>
                    {order.comment}
                  </Text>
                </Box>
              )}
            </Flex>
          </Card>

          {/* Tabla de Items - Optimizada para móvil */}
          <Card p={{ base: 3, md: 6 }} mb={4}>
            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="600" color={textColor} mb={3}>
              Ítems ({order.items?.length || 0})
            </Text>

            {order.items && order.items.length > 0 ? (
              <Flex direction="column" gap={2}>
                {order.items.map((item: ProductItem, index: number) => {
                  const subtotal = item.price * item.quantity;
                  return (
                    <Box
                      key={index}
                      p={3}
                      borderRadius="md"
                      backgroundColor={index % 2 === 0 ? 'transparent' : itemBgColor}
                      borderLeft={`3px solid ${brandStars}`}
                    >
                      {/* Grid de detalles */}
                      <Flex direction="column" gap={2} fontSize="xs">
                        {/* Fila 1: Tipo de Gas */}
                        <Flex justify="space-between">
                          <Text color={secondaryTextColor} fontWeight="500">
                            Tipo de Gas:
                          </Text>
                          <Text color={textColor} fontWeight="500">
                            {item.gasType}
                          </Text>
                        </Flex>

                        {/* Fila 2: Cantidad y Precio */}
                        <Flex justify="space-between">
                          <Text color={secondaryTextColor} fontWeight="500">
                            Cantidad:
                          </Text>
                          <Text color={textColor} fontWeight="600">
                            {item.quantity} unid.
                          </Text>
                        </Flex>

                        <Flex justify="space-between">
                          <Text color={secondaryTextColor} fontWeight="500">
                            Precio Unit.:
                          </Text>
                          <Text color={textColor} fontWeight="600">
                            {formatCRC(item.price)}
                          </Text>
                        </Flex>

                        {/* Fila 3: Subtotal (destacado) */}
                        <Flex justify="space-between" pt={2} borderTop={`1px solid ${borderColor}`}>
                          <Text color={brandStars} fontWeight="700">
                            Subtotal:
                          </Text>
                          <Text color={brandStars} fontWeight="700">
                            {formatCRC(subtotal)}
                          </Text>
                        </Flex>

                        {/* Comentario del item */}
                        {item.comment && (
                          <Text color={secondaryTextColor} fontSize="xs" mt={1} fontStyle="italic">
                            Nota: {item.comment}
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            ) : (
              <Text color={secondaryTextColor} textAlign="center" py={4}>
                No hay ítems en esta orden
              </Text>
            )}
          </Card>

          {/* Resumen de Totales */}
          <Card p={{ base: 4, md: 6 }} mb={4} bgColor={totalsBgColor}>
            <Flex direction="column" gap={3}>
              <Flex justify="space-between" pb={2} borderBottom={`2px solid ${borderColor}`}>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={secondaryTextColor} fontWeight="500">
                  Subtotal:
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={textColor} fontWeight="600">
                  {formatCRC(calculateTotal())}
                </Text>
              </Flex>

              <Flex justify="space-between">
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color={textColor}>
                  TOTAL:
                </Text>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color={brandStars}>
                  {formatCRC(calculateTotal())}
                </Text>
              </Flex>
            </Flex>
          </Card>

          {/* Enlace de Regreso */}
          <Center>
            <NavLink to="/admin/order/index">
              <Text color={brandStars} as="span" fontWeight="500" textAlign="center">
                Volver
              </Text>
            </NavLink>
          </Center>
        </>
      ) : (
        <Center>
          <Text color="secondaryGray.600">No se encontró la orden</Text>
        </Center>
      )}
    </>
  );
}