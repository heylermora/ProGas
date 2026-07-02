// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Button, FormControl, FormLabel, Input, Select, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react';
import { customAlphabet } from 'nanoid';
import { useHistory } from 'react-router-dom';
import Map from 'components/form/Map';
import OkModal from 'components/modal/OkModal';
import orderService from 'services/OrderService';
import productService from 'services/ProductService';
import type { ProductItem } from 'interfaces/OrderItem';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import OrderNavigation from './OrderNavigation';
import { addressToText, getCustomerDraft, saveCustomerDraft } from './customerDraft';

const nano = customAlphabet('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789', 6);

const parseCoordinates = (value?: string) => {
  const [lat, lng] = String(value || '').split(',').map((part) => Number(part.trim()));
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null;
};

const coordsToText = (coords?: number[] | null) => Array.isArray(coords) ? `${coords[1]},${coords[0]}` : '';

export default function Products() {
  const history = useHistory();
  const draft = getCustomerDraft();
  const defaultAddress = addressToText(draft.address);
  const [catalog, setCatalog] = useState([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [locationMap, setLocationMap] = useState({
    coords: parseCoordinates(draft.address?.coordinates),
    address: defaultAddress,
    isManualAddress: false,
  });
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
  const handleMapChange = (nextLocation) => {
    const coordinates = coordsToText(nextLocation.coords);
    setLocationMap(nextLocation);
    setOrderForm((prev) => ({
      ...prev,
      address: nextLocation.address || prev.address,
      coordinates: coordinates || prev.coordinates,
    }));
  };

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
    if (!orderForm.coordinates && !orderForm.locationUrl) {
      setMessage('Ingrese coordenadas o un enlace de ubicación como plan B.');
      return;
    }

    saveCustomerDraft({ address: { ...(draft.address || {}), coordinates: orderForm.coordinates, locationUrl: orderForm.locationUrl } });

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
        locationUrl: orderForm.locationUrl,
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
          <FormControl isRequired><FormLabel>Ubicación con mapa</FormLabel><Map value={locationMap} onChange={handleMapChange} /></FormControl>
          <FormControl isRequired><FormLabel>Dirección del pedido</FormLabel><Textarea value={orderForm.address} onChange={(e) => set('address', e.target.value)} /></FormControl>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl><FormLabel>Coordenadas exactas</FormLabel><Input value={orderForm.coordinates} onChange={(e) => set('coordinates', e.target.value)} placeholder="Ej. 9.8000,-84.1600" /></FormControl>
            <FormControl><FormLabel>Link de ubicación (plan B si el mapa falla)</FormLabel><Input value={orderForm.locationUrl} onChange={(e) => set('locationUrl', e.target.value)} placeholder="Google Maps / Waze" /></FormControl>
            <FormControl><FormLabel>Transporte</FormLabel><Input value={orderForm.transport} onChange={(e) => set('transport', e.target.value)} placeholder="Si aplica" /></FormControl>
            <FormControl isRequired><FormLabel>Método de pago</FormLabel><Select value={orderForm.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}><option>Efectivo</option><option>SINPE</option><option>Otro</option></Select></FormControl>
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
