import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AlertIcon, Badge, Box, Button, Checkbox, Divider, Flex, FormControl, FormHelperText, FormLabel, IconButton, Input, Select, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react';
import { customAlphabet } from 'nanoid';
import { useHistory } from 'react-router-dom';
import { MdAdd, MdDelete } from 'react-icons/md';
import DeliveryAddressField, { DeliveryLocationValue } from 'components/form/DeliveryAddressField';
import OkModal from 'components/modal/OkModal';
import orderService from 'services/OrderService';
import productService from 'services/ProductService';
import type { OrderPayment, ProductItem } from 'interfaces/OrderItem';
import type { Product } from 'interfaces/ProductItem';
import { PublicCard, PublicPage } from './PublicPage';
import MallPreview from './MallPreview';
import OrderNavigation from './OrderNavigation';
import { addressToText, getCustomerDraft, saveCustomerDraft } from './customerDraft';
import { mapsSearchUrl } from 'utils/location';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import { AddressItem } from 'interfaces/AddressItem';

const nano = customAlphabet('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789', 12);

export default function Products() {
  const history = useHistory();
  const draft = getCustomerDraft();
  const requestId = useRef(crypto.randomUUID());
  const orderCode = useRef(nano());
  const defaultAddress = addressToText(draft.address);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [message, setMessage] = useState('');
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [useCustomerAddress, setUseCustomerAddress] = useState(Boolean(defaultAddress));
  const [hasTransport, setHasTransport] = useState(false);
  const [orderForm, setOrderForm] = useState<{
    productId: string;
    quantity: number;
    cylinderDetails: string;
    address: string;
    coordinates: string;
    locationUrl: string;
    canonical?: AddressItem;
    transport: string;
    paymentMethod: OrderPayment['method'];
    comment: string;
  }>({
    productId: '',
    quantity: 1,
    cylinderDetails: '',
    address: defaultAddress,
    coordinates: draft.address?.coordinates || '',
    locationUrl: draft.address?.locationUrl || '',
    canonical: draft.address?.canonical,
    transport: '',
    paymentMethod: 'Efectivo',
    comment: '',
  });

  useEffect(() => {
    setIsCatalogLoading(true);
    productService.getAll().then((products) => {
      const list = products || [];
      setCatalog(list);
      if (list[0]) setOrderForm((prev) => ({ ...prev, productId: list[0].id }));
    }).catch(() => setCatalogError('No se pudo cargar el catálogo de productos.'))
      .finally(() => setIsCatalogLoading(false));
  }, []);

  const selectedProduct = useMemo(() => catalog.find((product) => product.id === orderForm.productId), [catalog, orderForm.productId]);
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const set = <K extends keyof typeof orderForm>(key: K, value: typeof orderForm[K]) => setOrderForm((prev) => ({ ...prev, [key]: value }));

  const removeItem = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const effectiveAddress = useCustomerAddress ? defaultAddress : orderForm.address;
  const effectiveCoordinates = useCustomerAddress ? draft.address?.coordinates || '' : orderForm.coordinates;
  const effectiveLocationUrl = useCustomerAddress ? draft.address?.locationUrl || '' : orderForm.locationUrl;
  const effectiveCanonical = useCustomerAddress ? draft.address?.canonical : orderForm.canonical;

  const addItem = () => {
    if (!selectedProduct) return;
    const quantity = Number(orderForm.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      setMessage('La cantidad debe ser un número entero entre 1 y 99.');
      return;
    }
    if (selectedProduct.active === false || Number(selectedProduct.stock ?? 0) < quantity) {
      setMessage('El producto no está disponible en la cantidad solicitada.');
      return;
    }
    setMessage('');
    setItems((prev) => [
      ...prev,
      {
        productId: selectedProduct.id,
        gasType: selectedProduct.description,
        quantity,
        price: Number(selectedProduct.price || 0),
        unitCost: Number(selectedProduct.costPrice || 0),
        comment: orderForm.cylinderDetails,
      },
    ]);
  };

  const submitOrder = async () => {
    if (isSubmitting) return;
    setMessage('');
    if (!draft.nationalId || !draft.phone) {
      setMessage('Primero debe verificar cédula y teléfono.');
      return;
    }
    if (!items.length) {
      setMessage('Agregue al menos un producto al pedido.');
      return;
    }
    if (!effectiveAddress.trim()) {
      setMessage('Ingresá una dirección de entrega antes de confirmar.');
      return;
    }
    const locationUrl = effectiveLocationUrl || mapsSearchUrl(effectiveCoordinates || effectiveAddress);

    if (useCustomerAddress) {
      saveCustomerDraft({ address: { ...(draft.address || {}), coordinates: effectiveCoordinates, locationUrl } });
    }

    try {
      setIsSubmitting(true);
      await orderService.createWithStock({
        orderCode: orderCode.current,
        requestId: requestId.current,
        status: 'Nuevo',
        requestDate: new Date().toISOString(),
        client: draft.name || draft.nickname || draft.nationalId,
        clientId: draft.nationalId,
        phone: draft.phone,
        location: {
          address: effectiveAddress,
          coordinates: effectiveCoordinates,
          locationUrl,
          ...(effectiveCanonical?.position ? { lat: effectiveCanonical.position.latitude, lng: effectiveCanonical.position.longitude } : {}),
        },
        ...(effectiveCanonical ? { deliveryAddressSnapshot: effectiveCanonical } : {}),
        ...(useCustomerAddress && draft.address?.savedAddressId ? { customerAddressId: draft.address.savedAddressId } : {}),
        paymentMethod: orderForm.paymentMethod,
        transport: hasTransport ? orderForm.transport : '',
        comment: orderForm.comment,
        items,
        totalAmount,
      });
      setCreatedOrderCode(orderCode.current);
      setShowModal(true);
    } catch {
      setMessage('No pudimos crear el pedido. Revisá tu conexión e intentá nuevamente; no se realizó ningún cobro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPage title="Productos y pedido" description="Confirme productos, pago y ubicación. La dirección viene por defecto desde el cliente, pero puede ajustarse para este pedido.">
      <Box h={{ base: '8px', md: '12px' }} />
      {(isCatalogLoading || catalogError) ? <AsyncContent isLoading={isCatalogLoading} error={catalogError} loadingLabel="Cargando productos" /> :
      <PublicCard>
        <Stack spacing="16px">
          {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
          <Box p={{ base: '12px', md: '16px' }} border="1px solid" borderColor="gray.200" borderRadius="18px" bg="gray.50">
            <Stack spacing="14px">
              <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap="10px" direction={{ base: 'column', md: 'row' }}>
                <Box>
                  <Text fontWeight="900" fontSize={{ base: 'lg', md: 'xl' }}>Productos del pedido</Text>
                  <Text color="gray.500" fontSize="sm">Agregá uno o varios productos antes de confirmar.</Text>
                </Box>
                <Badge colorScheme={items.length ? 'green' : 'gray'} px="10px" py="6px" borderRadius="full">{items.length} producto(s)</Badge>
              </Flex>
              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="12px">
                <FormControl isRequired><FormLabel>Producto</FormLabel><Select bg="white" value={orderForm.productId} onChange={(e) => set('productId', e.target.value)}>{catalog.map((product) => <option key={product.id} value={product.id}>{product.description}</option>)}</Select></FormControl>
                <FormControl isRequired><FormLabel>Cantidad</FormLabel><Input bg="white" type="number" min="1" value={orderForm.quantity} onChange={(e) => set('quantity', Number(e.target.value))} /></FormControl>
                <FormControl><FormLabel>Datos del cilindro</FormLabel><Input bg="white" value={orderForm.cylinderDetails} onChange={(e) => set('cylinderDetails', e.target.value)} placeholder="Tipo / tamaño si aplica" /></FormControl>
              </SimpleGrid>
              <Button leftIcon={<MdAdd />} alignSelf={{ base: 'stretch', md: 'flex-start' }} onClick={addItem} isDisabled={!selectedProduct}>Agregar producto</Button>
              <Divider />
              <Stack spacing="8px">
                {!items.length && <Box p="14px" borderWidth="1px" borderStyle="dashed" borderRadius="14px" bg="white"><Text color="gray.500" fontSize="sm">Todavía no hay productos agregados.</Text></Box>}
                {items.map((item, index) => (
                  <Flex key={`${item.productId}-${index}`} p="12px" borderWidth="1px" borderRadius="14px" bg="white" justify="space-between" align="center" gap="10px">
                    <Box minW="0">
                      <Text fontWeight="800" noOfLines={1}>{item.gasType}</Text>
                      <Text fontSize="sm" color="gray.500">Cantidad: {item.quantity} • ₡{item.price}</Text>
                    </Box>
                    <IconButton aria-label="Quitar producto" icon={<MdDelete />} variant="ghost" colorScheme="red" onClick={() => removeItem(index)} />
                  </Flex>
                ))}
              </Stack>
              <Flex justify="space-between" align="center" fontWeight="900" fontSize={{ base: 'md', md: 'lg' }}>
                <Text>Total estimado</Text>
                <Text>₡{totalAmount.toLocaleString('es-CR')}</Text>
              </Flex>
            </Stack>
          </Box>
          <Box p={{ base: '12px', md: '16px' }} border="1px solid" borderColor="gray.200" borderRadius="18px">
            <Stack spacing="12px">
              <Checkbox isChecked={useCustomerAddress} onChange={(e) => setUseCustomerAddress(e.target.checked)} isDisabled={!defaultAddress} fontWeight="700">
                Usar la dirección registrada del cliente
              </Checkbox>
              {useCustomerAddress && (
                <Box p="12px" borderRadius="14px" bg="gray.50">
                  <Text fontSize="sm" color="gray.600">Dirección del cliente</Text>
                  <Text fontWeight="800">{defaultAddress || 'Sin dirección guardada'}</Text>
                </Box>
              )}
              {!useCustomerAddress && (
                <Stack spacing="12px">
                  <DeliveryAddressField value={{ address: orderForm.address, coordinates: orderForm.coordinates, locationUrl: orderForm.locationUrl, canonical: orderForm.canonical, ...(orderForm.canonical?.position ? { lat: orderForm.canonical.position.latitude, lng: orderForm.canonical.position.longitude } : {}) }} onChange={(location: DeliveryLocationValue) => setOrderForm(prev => ({ ...prev, address: location.address, coordinates: location.coordinates || '', locationUrl: location.locationUrl || '', canonical: location.canonical }))} />
                </Stack>
              )}
            </Stack>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl>
              <Checkbox isChecked={hasTransport} onChange={(e) => setHasTransport(e.target.checked)} fontWeight="700">
                Agregar transporte
              </Checkbox>
              <FormHelperText>Marcá esta opción si el pedido necesita entrega, ruta especial o coordinación de transporte.</FormHelperText>
              {hasTransport && <Input mt="10px" value={orderForm.transport} onChange={(e) => set('transport', e.target.value)} placeholder="Detalle del transporte" />}
            </FormControl>
            <FormControl isRequired><FormLabel>Método de pago</FormLabel><Select value={orderForm.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value as OrderPayment['method'])}><option value="Efectivo">Efectivo</option><option value="Sinpe">SINPE</option><option value="Otro">Otro</option></Select></FormControl>
          </SimpleGrid>
          <FormControl><FormLabel>Comentario</FormLabel><Textarea value={orderForm.comment} onChange={(e) => set('comment', e.target.value)} /></FormControl>
          <OrderNavigation currentStep={3} backLabel="Volver a cliente" continueLabel={isSubmitting ? 'Confirmando…' : 'Confirmar pedido'} isFinal onBack={() => history.replace('/customer/info')} onContinue={submitOrder} isContinueLoading={isSubmitting} />
        </Stack>
      </PublicCard>
      }
      <MallPreview compact />
      <Box h={{ base: '8px', md: '12px' }} />
      {showModal && <OkModal message="Pedido creado correctamente. Guardá el código para consultar su estado." code={createdOrderCode} isOpen={showModal} onClose={() => { setShowModal(false); history.push('/customer/view-order'); }} />}
    </PublicPage>
  );
}
