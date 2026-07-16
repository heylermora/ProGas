// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Button, FormControl, FormLabel, Input, Select, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react';
import { customAlphabet } from 'nanoid';
import { useHistory } from 'react-router-dom';
import DeviceLocationMap from 'components/form/DeviceLocationMap';
import OkModal from 'components/modal/OkModal';
import orderService from 'services/OrderService';
import productService from 'services/ProductService';
import type { ProductItem } from 'interfaces/OrderItem';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import OrderNavigation from './OrderNavigation';
import { addressToText, getCustomerDraft, saveCustomerDraft } from './customerDraft';
import { mapsSearchUrl } from 'utils/location';

const nano = customAlphabet('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789', 6);

export default function Products() {
  const history = useHistory();
  const draft = getCustomerDraft();
  const defaultAddress = addressToText(draft.address);
  const [catalog, setCatalog] = useState([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [orderForm, setOrderForm] = useState({
    productId: '',
    quantity: 1,
    cylinderDetails: '',
    address: defaultAddress,
    coordinates: draft.address?.coordinates || '',
    locationUrl: draft.address?.locationUrl || '',
    transport: '',
    paymentMethod: 'Efectivo',
    comment: '',
  });

  useEffect(() => {
    productService.getAll().then((products) => {
      const list = products || [];
      setCatalog(list);
      if (list[0]) setOrderForm((prev) => ({ ...prev, productId: list[0].id }));
    }).catch(() => setMessage('No se pudo cargar el catálogo de productos.'));
  }, []);

  const selectedProduct = useMemo(() => catalog.find((product) => product.id === orderForm.productId), [catalog, orderForm.productId]);
  const set = (key, value) => setOrderForm((prev) => ({ ...prev, [key]: value }));



  const addItem = () => {
    if (!selectedProduct) return;
    setItems((prev) => [
      ...prev,
      {
        productId: selectedProduct.id,
        gasType: selectedProduct.description,
        quantity: Number(orderForm.quantity || 1),
        price: Number(selectedProduct.price || 0),
        comment: orderForm.cylinderDetails,
      },
    ]);
  };

  const submitOrder = async () => {
    if (!draft.nationalId || !draft.phone) {
      setMessage('Primero debe verificar cédula y teléfono.');
      return;
    }
    if (!items.length) {
      setMessage('Agregue al menos un producto al pedido.');
      return;
    }
    const locationUrl = orderForm.locationUrl || mapsSearchUrl(orderForm.coordinates || orderForm.address);

    saveCustomerDraft({ address: { ...(draft.address || {}), coordinates: orderForm.coordinates, locationUrl } });

    await orderService.create({
      orderCode: nano(),
      status: 'Nuevo',
      requestDate: new Date().toISOString(),
      client: draft.name || draft.nickname || draft.nationalId,
      clientId: draft.nationalId,
      phone: draft.phone,
      location: {
        address: orderForm.address,
        coordinates: orderForm.coordinates,
        locationUrl,
      },
      paymentMethod: orderForm.paymentMethod,
      transport: orderForm.transport,
      comment: orderForm.comment,
      items,
      totalAmount: items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    });
    setShowModal(true);
  };

  return (
    <PublicPage title="Productos y pedido" description="Confirme productos, pago y ubicación. La dirección viene por defecto desde el cliente, pero puede ajustarse para este pedido.">
      <SponsorStrip type="General" max={4} title="Patrocinadores" />
      <Box h={{ base: '8px', md: '12px' }} />
      <PublicCard>
        <Stack spacing="16px">
          {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="16px">
            <FormControl isRequired><FormLabel>Producto</FormLabel><Select value={orderForm.productId} onChange={(e) => set('productId', e.target.value)}>{catalog.map((product) => <option key={product.id} value={product.id}>{product.description}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Cantidad</FormLabel><Input type="number" min="1" value={orderForm.quantity} onChange={(e) => set('quantity', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Datos del cilindro</FormLabel><Input value={orderForm.cylinderDetails} onChange={(e) => set('cylinderDetails', e.target.value)} placeholder="Tipo / tamaño si aplica" /></FormControl>
          </SimpleGrid>
          <Button alignSelf="flex-start" onClick={addItem}>Agregar producto</Button>
          <Stack spacing="8px">
            {items.map((item, index) => <Box key={`${item.productId}-${index}`} p="12px" borderWidth="1px" borderRadius="12px"><Text fontWeight="700">{item.gasType}</Text><Text fontSize="sm">Cantidad: {item.quantity} • ₡{item.price}</Text></Box>)}
          </Stack>
          <FormControl isRequired><FormLabel>Dirección del pedido</FormLabel><Textarea value={orderForm.address} onChange={(e) => set('address', e.target.value)} placeholder="Barrio y señas principales" /></FormControl>
          <FormControl>
            <FormLabel>Ubicación en el mapa</FormLabel>
            <DeviceLocationMap
              coordinates={orderForm.coordinates}
              addressQuery={orderForm.address}
              onLocation={(location) => setOrderForm((prev) => ({ ...prev, ...location }))}
            />
          </FormControl>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl><FormLabel>Transporte</FormLabel><Input value={orderForm.transport} onChange={(e) => set('transport', e.target.value)} placeholder="Si aplica" /></FormControl>
            <FormControl isRequired><FormLabel>Método de pago</FormLabel><Select value={orderForm.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}><option value="Efectivo">Efectivo</option><option value="SINPE">SINPE</option><option value="Otro">Otro</option></Select></FormControl>
          </SimpleGrid>
          <FormControl><FormLabel>Comentario</FormLabel><Textarea value={orderForm.comment} onChange={(e) => set('comment', e.target.value)} /></FormControl>
          <OrderNavigation currentStep={3} backLabel="Volver a cliente" continueLabel="Confirmar pedido" isFinal onBack={() => history.push('/customer/info')} onContinue={submitOrder} />
        </Stack>
      </PublicCard>
      <Box h={{ base: '8px', md: '12px' }} />
      <SponsorStrip type="General" max={8} offset={4} title="Patrocinadores" />
      {showModal && <OkModal message="Pedido creado correctamente." isOpen={showModal} onClose={() => setShowModal(false)} />}
    </PublicPage>
  );
}
