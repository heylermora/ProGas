import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert, AlertIcon, Box, Button, Divider, Flex, FormControl, FormErrorMessage,
  FormHelperText, FormLabel, Heading, HStack, Icon, Input, InputGroup, InputLeftAddon,
  Select, SimpleGrid, Stack, Text, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { MdCheck, MdInventory2, MdLocalOffer, MdPayments, MdWarning } from 'react-icons/md';
import Card from 'components/card/Card';
import HelpLabel from 'components/form/HelpLabel';
import productService from 'services/ProductService';
import { Product, ProductCategory } from 'interfaces/ProductItem';
import useCategories from 'hooks/useCategories';
import FormPageHeader from 'components/layout/FormPageHeader';
import StatusBadge from 'components/dataDisplay/StatusBadge';
import ActiveSwitch from 'components/form/ActiveSwitch';

type ProductDraft = Omit<Product, 'id'>;
interface Props { product?: Product; isLoading?: boolean; }

const defaults: ProductDraft = {
  description: '', sku: '', category: 'Gas', price: 0, costPrice: 0,
  stock: 0, lowStockThreshold: 5, active: true,
};
const crc = (value: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(value || 0);

export default function ProductForm({ product, isLoading = false }: Props) {
  const { categories } = useCategories('products');
  const history = useHistory();
  const toast = useToast();
  const [values, setValues] = useState<ProductDraft>(() => product ? {
    description: product.description || '', sku: product.sku || '', category: product.category || 'Otros',
    price: Number(product.price || 0), costPrice: Number(product.costPrice || 0), stock: Number(product.stock || 0),
    lowStockThreshold: Number(product.lowStockThreshold ?? 5), active: product.active !== false,
  } : defaults);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textColor = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const subtleBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const actionBg = useColorModeValue('rgba(255,255,255,.94)', 'rgba(17,25,54,.94)');

  const set = (key: keyof ProductDraft, value: any) => setValues((current) => ({ ...current, [key]: value }));
  const invalid = !values.description.trim() || !values.category || values.price <= 0 || values.costPrice < 0 || values.stock < 0 || Number(values.lowStockThreshold) < 0;
  const margin = values.price - values.costPrice;
  const marginPercent = values.price > 0 ? (margin / values.price) * 100 : 0;
  const inventoryValue = values.stock * values.costPrice;
  const categoryOptions = useMemo(() => Array.from(new Set([values.category, ...categories].filter(Boolean))), [categories, values.category]);

  const goBack = () => history.push('/admin/product/index');
  const save = async () => {
    setSubmitted(true);
    if (invalid) { toast({ title: 'Revisá los campos marcados', status: 'warning' }); return; }
    setSaving(true);
    const payload = { ...values, description: values.description.trim(), sku: values.sku?.trim().toUpperCase(), updatedAt: new Date().toISOString() };
    try {
      if (product) await productService.edit(product.id, { id: product.id, ...payload });
      else await productService.create(payload);
      toast({ title: product ? 'Producto actualizado' : 'Producto creado', description: 'Los cambios ya están disponibles en el inventario.', status: 'success', duration: 3000 });
      goBack();
    } catch {
      toast({ title: 'No pudimos guardar el producto', description: 'Revisá la conexión e intentá nuevamente.', status: 'error', duration: 4000 });
    } finally { setSaving(false); }
  };

  return (
    <Box pt={{ base: '120px', md: '78px' }} maxW="1180px" mx="auto" pb="48px">
      <FormPageHeader title={product ? values.description || 'Editar producto' : 'Nuevo producto'} description={product ? 'Actualizá precios, datos comerciales y disponibilidad desde una sola pantalla.' : 'Completá los datos comerciales y la existencia inicial para comenzar a vender.'} onBack={goBack} backLabel="Volver al inventario" status={<StatusBadge active={values.active} activeLabel="Producto activo" inactiveLabel="Producto inactivo" />} />

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="20px" alignItems="start">
        <Stack gridColumn={{ lg: 'span 2' }} spacing="18px">
          <Card p={{ base: '18px', md: '24px' }}>
            <SectionTitle icon={MdLocalOffer} title="Información comercial" description="Así se identificará el producto al crear pedidos." />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="18px" mt="20px">
              <FormControl gridColumn={{ md: 'span 2' }} isRequired isInvalid={submitted && !values.description.trim()}>
                <FormLabel>Nombre del producto</FormLabel>
                <Input value={values.description} onChange={(event) => set('description', event.target.value)} placeholder="Ej. Cilindro de gas 25 lb" autoFocus={!product} />
                <FormErrorMessage>Ingresá un nombre para reconocer el producto.</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={submitted && !values.category}>
                <HelpLabel help="Usamos la categoría para ordenar el inventario y facilitar los filtros.">Categoría</HelpLabel>
                <Select value={values.category} onChange={(event) => set('category', event.target.value as ProductCategory)}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</Select>
                <FormErrorMessage>Seleccioná una categoría.</FormErrorMessage>
              </FormControl>
              <FormControl>
                <HelpLabel help="Código interno opcional. Se guarda en mayúsculas y también sirve para buscar el producto.">SKU / código</HelpLabel>
                <Input value={values.sku} onChange={(event) => set('sku', event.target.value)} placeholder="Ej. GAS-25" textTransform="uppercase" />
              </FormControl>
            </SimpleGrid>
          </Card>

          <Card p={{ base: '18px', md: '24px' }}>
            <SectionTitle icon={MdPayments} title="Precios" description="Definí el costo real y el precio que verá el cliente." />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="18px" mt="20px">
              <FormControl isRequired isInvalid={submitted && values.price <= 0}>
                <HelpLabel help="Monto final que se cobrará por cada unidad." required>Precio de venta</HelpLabel>
                <InputGroup><InputLeftAddon>₡</InputLeftAddon><Input type="number" min={1} value={values.price || ''} onChange={(event) => set('price', Number(event.target.value))} placeholder="0" /></InputGroup>
                <FormErrorMessage>El precio debe ser mayor que cero.</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={submitted && values.costPrice < 0}>
                <HelpLabel help="Lo que le cuesta al negocio cada unidad; se usa para calcular utilidad y valor de inventario.">Precio de costo</HelpLabel>
                <InputGroup><InputLeftAddon>₡</InputLeftAddon><Input type="number" min={0} value={values.costPrice || ''} onChange={(event) => set('costPrice', Number(event.target.value))} placeholder="0" /></InputGroup>
                <FormErrorMessage>El costo no puede ser negativo.</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            {values.price > 0 && margin < 0 && <Alert status="warning" mt="16px" borderRadius="xl"><AlertIcon />El precio de venta está por debajo del costo.</Alert>}
          </Card>

          <Card p={{ base: '18px', md: '24px' }}>
            <SectionTitle icon={MdInventory2} title="Inventario" description={product ? 'El ajuste posterior de existencias también puede hacerse desde la tabla de productos.' : 'Indicá con cuántas unidades comenzará el producto.'} />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="18px" mt="20px">
              <FormControl isInvalid={submitted && values.stock < 0}>
                <HelpLabel help="Cantidad que está físicamente disponible para vender.">Unidades disponibles</HelpLabel>
                <Input type="number" min={0} value={values.stock} onChange={(event) => set('stock', Number(event.target.value))} />
                <FormErrorMessage>Las existencias no pueden ser negativas.</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={submitted && Number(values.lowStockThreshold) < 0}>
                <HelpLabel help="Cuando las existencias sean iguales o menores a este número, el inventario mostrará una alerta.">Avisar cuando queden</HelpLabel>
                <Input type="number" min={0} value={values.lowStockThreshold} onChange={(event) => set('lowStockThreshold', Number(event.target.value))} />
                <FormHelperText>Unidades antes de considerar el stock como bajo.</FormHelperText>
              </FormControl>
            </SimpleGrid>
            <Flex mt="20px" p="14px" bg={subtleBg} borderRadius="14px" justify="space-between" align="center" gap="12px">
              <Box><Text fontWeight="800">Disponible para pedidos</Text><Text fontSize="sm" color={muted}>Al desactivarlo seguirá en el historial, pero no podrá agregarse a pedidos nuevos.</Text></Box>
              <ActiveSwitch id="product-available" label="Producto activo" isChecked={values.active} onChange={checked => set('active', checked)} />
            </Flex>
          </Card>
        </Stack>

        <Card p={{ base: '18px', md: '22px' }} position={{ lg: 'sticky' }} top={{ lg: '105px' }}>
          <Heading size="md" color={textColor}>Resumen</Heading>
          <Text color={muted} fontSize="sm" mt="4px">Revisá los valores antes de guardar.</Text>
          <Stack spacing="14px" mt="20px" divider={<Divider borderColor={border} />}>
            <Summary label="Producto" value={values.description || 'Sin nombre'} />
            <Summary label="Categoría" value={values.category || 'Sin categoría'} />
            <Summary label="Precio de venta" value={crc(values.price)} strong />
            <Summary label="Ganancia por unidad" value={crc(margin)} tone={margin < 0 ? 'red.500' : 'green.500'} detail={`${marginPercent.toFixed(1)}% del precio`} />
            <Summary label="Valor del inventario" value={crc(inventoryValue)} detail={`${values.stock || 0} unidades al costo`} />
          </Stack>
          {Number(values.stock) <= Number(values.lowStockThreshold) && <HStack mt="18px" p="12px" bg="orange.50" color="orange.700" borderRadius="xl"><Icon as={MdWarning} /><Text fontSize="sm" fontWeight="700">El producto iniciará con stock bajo.</Text></HStack>}
        </Card>
      </SimpleGrid>

      <Flex mt="24px" p={{ base: 3, md: 4 }} bg={actionBg} borderWidth="1px" borderColor={border} borderRadius="2xl" boxShadow="lg" position="sticky" bottom="12px" zIndex={5} justify="space-between" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap="10px" backdropFilter="blur(12px)">
        <Text color={muted} fontSize="sm">{invalid ? 'Revisá los campos obligatorios antes de guardar.' : 'Todo listo para guardar los cambios.'}</Text>
        <HStack justify={{ base: 'stretch', sm: 'flex-end' }}><Button flex={{ base: 1, sm: 'initial' }} variant="ghost" onClick={goBack} isDisabled={saving}>Cancelar</Button><Button flex={{ base: 1, sm: 'initial' }} leftIcon={<MdCheck />} colorScheme="brand" size="lg" px="28px" isLoading={saving || isLoading} loadingText="Guardando" onClick={save}>{product ? 'Guardar cambios' : 'Crear producto'}</Button></HStack>
      </Flex>
    </Box>
  );
}

function SectionTitle({ icon, title, description }: { icon: any; title: string; description: string }) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  return <HStack align="flex-start" spacing="12px"><Flex boxSize="42px" borderRadius="14px" bg="brand.50" color="brand.500" align="center" justify="center" flexShrink={0}><Icon as={icon} boxSize="22px" /></Flex><Box><Heading size="md">{title}</Heading><Text color={muted} fontSize="sm" mt="2px">{description}</Text></Box></HStack>;
}

function Summary({ label, value, detail, strong, tone }: { label: string; value: string; detail?: string; strong?: boolean; tone?: string }) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  return <Box><Text color={muted} fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing=".04em">{label}</Text><Text mt="3px" fontWeight={strong ? '900' : '700'} fontSize={strong ? 'xl' : 'md'} color={tone}>{value}</Text>{detail && <Text color={muted} fontSize="xs">{detail}</Text>}</Box>;
}
