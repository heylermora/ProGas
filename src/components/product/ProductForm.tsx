import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box, Button, FormControl, FormErrorMessage, FormLabel, Grid, Heading, HStack,
  Input, InputGroup, InputLeftAddon, Select, SimpleGrid, Switch, Text,
  useColorModeValue, useToast,
} from '@chakra-ui/react';
import { MdArrowBack, MdCheck } from 'react-icons/md';
import Card from 'components/card/Card';
import productService from 'services/ProductService';
import { Product, PRODUCT_CATEGORIES, ProductCategory } from 'interfaces/ProductItem';

type ProductDraft = Omit<Product, 'id'>;

interface Props { product?: Product; isLoading?: boolean; }

const defaults: ProductDraft = {
  description: '', sku: '', category: 'Gas', price: 0, costPrice: 0,
  stock: 0, lowStockThreshold: 5, active: true,
};

export default function ProductForm({ product, isLoading = false }: Props) {
  const history = useHistory();
  const toast = useToast();
  const [values, setValues] = useState<ProductDraft>(() => product ? {
    description: product.description || '', sku: product.sku || '',
    category: product.category || 'Otros', price: Number(product.price || 0),
    costPrice: Number(product.costPrice || 0), stock: Number(product.stock || 0),
    lowStockThreshold: Number(product.lowStockThreshold ?? 5), active: product.active !== false,
  } : defaults);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textColor = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const subtleBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const set = (key: keyof ProductDraft, value: any) => setValues(current => ({ ...current, [key]: value }));
  const invalid = !values.description.trim() || values.price <= 0 || values.costPrice < 0 || values.stock < 0;

  const save = async () => {
    setSubmitted(true);
    if (invalid) return;
    setSaving(true);
    const payload = { ...values, description: values.description.trim(), sku: values.sku?.trim().toUpperCase(), updatedAt: new Date().toISOString() };
    try {
      if (product) await productService.edit(product.id, { id: product.id, ...payload });
      else await productService.create(payload);
      toast({ title: product ? 'Producto actualizado' : 'Producto creado', description: 'Los cambios ya están disponibles en el inventario.', status: 'success', duration: 3000 });
      history.push('/admin/product/index');
    } catch {
      toast({ title: 'No pudimos guardar el producto', description: 'Revise su conexión e inténtelo nuevamente.', status: 'error', duration: 4000 });
    } finally { setSaving(false); }
  };

  return (
    <Box pt={{ base: '150px', md: '80px' }} maxW="1050px" mx="auto">
      <Button leftIcon={<MdArrowBack />} variant="ghost" mb="18px" onClick={() => history.push('/admin/product/index')}>Volver al inventario</Button>
      <Heading color={textColor} fontSize={{ base: '28px', md: '36px' }}>{product ? 'Editar producto' : 'Nuevo producto'}</Heading>
      <Text color={muted} mt="8px" mb="26px">Complete la información comercial y de inventario.</Text>
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="22px">
        <Card p={{ base: '20px', md: '28px' }}>
          <Heading size="md" color={textColor} mb="22px">Información del producto</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="20px">
            <FormControl gridColumn={{ md: 'span 2' }} isInvalid={submitted && !values.description.trim()}>
              <FormLabel>Nombre del producto</FormLabel><Input value={values.description} onChange={e => set('description', e.target.value)} placeholder="Ej. Cilindro de gas 25 lb" />
              <FormErrorMessage>Ingrese un nombre para el producto.</FormErrorMessage>
            </FormControl>
            <FormControl><FormLabel>Categoría</FormLabel><Select value={values.category} onChange={e => set('category', e.target.value as ProductCategory)}>{PRODUCT_CATEGORIES.map(category => <option key={category}>{category}</option>)}</Select></FormControl>
            <FormControl><FormLabel>SKU / código</FormLabel><Input value={values.sku} onChange={e => set('sku', e.target.value)} placeholder="Ej. GAS-25" /></FormControl>
            <FormControl isInvalid={submitted && values.price <= 0}><FormLabel>Precio de venta</FormLabel><InputGroup><InputLeftAddon>₡</InputLeftAddon><Input type="number" min={1} value={values.price} onChange={e => set('price', Number(e.target.value))} /></InputGroup><FormErrorMessage>Debe ser mayor que cero.</FormErrorMessage></FormControl>
            <FormControl isInvalid={submitted && values.costPrice < 0}><FormLabel>Precio de costo</FormLabel><InputGroup><InputLeftAddon>₡</InputLeftAddon><Input type="number" min={0} value={values.costPrice} onChange={e => set('costPrice', Number(e.target.value))} /></InputGroup></FormControl>
          </SimpleGrid>
        </Card>
        <Card p={{ base: '20px', md: '28px' }}>
          <Heading size="md" color={textColor} mb="22px">Inventario</Heading>
          <FormControl isInvalid={submitted && values.stock < 0} mb="18px"><FormLabel>Cantidad disponible</FormLabel><Input type="number" min={0} value={values.stock} onChange={e => set('stock', Number(e.target.value))} /></FormControl>
          <FormControl mb="24px"><FormLabel>Alerta de stock bajo</FormLabel><Input type="number" min={0} value={values.lowStockThreshold} onChange={e => set('lowStockThreshold', Number(e.target.value))} /><Text fontSize="xs" color={muted} mt="6px">Avisaremos cuando las unidades lleguen a este nivel.</Text></FormControl>
          <HStack justify="space-between" p="14px" bg={subtleBg} borderRadius="12px"><Box><Text fontWeight="700">Producto activo</Text><Text fontSize="xs" color={muted}>Visible para crear pedidos</Text></Box><Switch colorScheme="green" isChecked={values.active} onChange={e => set('active', e.target.checked)} /></HStack>
        </Card>
      </Grid>
      <HStack justify="flex-end" mt="24px"><Button variant="outline" onClick={() => history.push('/admin/product/index')}>Cancelar</Button><Button leftIcon={<MdCheck />} colorScheme="brand" isLoading={saving || isLoading} onClick={save}>{product ? 'Guardar cambios' : 'Crear producto'}</Button></HStack>
    </Box>
  );
}
