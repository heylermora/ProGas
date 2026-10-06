import {
Alert, AlertIcon, Box, Flex, Heading, HStack, Icon, Input, InputGroup, InputLeftAddon,
Select, SimpleGrid, Stack, Text, useColorModeValue, useToast
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import StatusBadge from 'components/dataDisplay/StatusBadge';
import ActiveSwitch from 'components/form/ActiveSwitch';
import Form from 'components/form/Form';
import FormField from 'components/form/FormField';
import useCategories from 'hooks/useCategories';
import { Product, ProductCategory } from 'interfaces/ProductItem';
import { useMemo, useState } from 'react';
import { MdInventory2, MdLocalOffer, MdPayments, MdWarning } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import productService from 'services/ProductService';

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
    <Form
      title={product ? values.description || 'Editar producto' : 'Nuevo producto'}
      description={product ? 'Actualizá precios, datos comerciales y disponibilidad desde una sola pantalla.' : 'Completá los datos comerciales y la existencia inicial para comenzar a vender.'}
      status={<StatusBadge active={values.active} activeLabel="Producto activo" inactiveLabel="Producto inactivo" />}
      onBack={goBack}
      backLabel="Volver al inventario"
      submitLabel={product ? 'Guardar cambios' : 'Crear producto'}
      isSubmitting={saving || isLoading}
      footerMessage={invalid ? 'Revisá los campos obligatorios antes de guardar.' : 'Todo listo para guardar los cambios.'}
      pt={{ base: '120px', md: '78px' }} maxW="1080px" mx="auto" pb="48px" px={{ base: 1, md: 3 }}
      onFormSubmit={(event) => { event.preventDefault(); save(); }}
    >
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing="20px" alignItems="start">
        <Stack gridColumn={{ xl: 'span 2' }} spacing="18px">
          <Card p={{ base: '18px', md: '24px' }}>
            <SectionTitle icon={MdLocalOffer} title="Información comercial" description="Así se identificará el producto al crear pedidos." />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="18px" mt="20px">
              <FormField gridColumn={{ md: 'span 2' }} isRequired isInvalid={submitted && !values.description.trim()} label={<>Nombre del producto</>} error={<> Ingresá un nombre para reconocer el producto. </>}>

                <Input value={values.description} onChange={(event) => set('description', event.target.value)} placeholder="Ej. Cilindro de gas 25 lb" autoFocus={!product} />

              </FormField>
              <FormField isRequired isInvalid={submitted && !values.category} label={<>Categoría</>} help="Usamos la categoría para ordenar el inventario y facilitar los filtros." error={<> Seleccioná una categoría. </>}>

                <Select value={values.category} onChange={(event) => set('category', event.target.value as ProductCategory)}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</Select>

              </FormField>
              <FormField  label={<>SKU / código</>} help="Código interno opcional. Se guarda en mayúsculas y también sirve para buscar el producto.">

                <Input value={values.sku} onChange={(event) => set('sku', event.target.value)} placeholder="Ej. GAS-25" textTransform="uppercase" />
              </FormField>
            </SimpleGrid>
          </Card>

          <Card p={{ base: '18px', md: '24px' }}>
            <SectionTitle icon={MdPayments} title="Precios" description="Definí el costo real y el precio que verá el cliente." />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="18px" mt="20px">
              <FormField isRequired isInvalid={submitted && values.price <= 0} label={<>Precio de venta</>} help="Monto final que se cobrará por cada unidad." error={<> El precio debe ser mayor que cero. </>}>

                <InputGroup><InputLeftAddon>₡</InputLeftAddon><Input type="number" min={1} value={values.price || ''} onChange={(event) => set('price', Number(event.target.value))} placeholder="0" /></InputGroup>

              </FormField>
              <FormField isInvalid={submitted && values.costPrice < 0} label={<>Precio de costo</>} help="Lo que le cuesta al negocio cada unidad; se usa para calcular utilidad y valor de inventario." error={<> El costo no puede ser negativo. </>}>

                <InputGroup><InputLeftAddon>₡</InputLeftAddon><Input type="number" min={0} value={values.costPrice || ''} onChange={(event) => set('costPrice', Number(event.target.value))} placeholder="0" /></InputGroup>

              </FormField>
            </SimpleGrid>
            {values.price > 0 && margin < 0 && <Alert status="warning" mt="16px" borderRadius="xl"><AlertIcon />El precio de venta está por debajo del costo.</Alert>}
          </Card>

          <Card p={{ base: '18px', md: '24px' }}>
            <SectionTitle icon={MdInventory2} title="Inventario" description={product ? 'El ajuste posterior de existencias también puede hacerse desde la tabla de productos.' : 'Indicá con cuántas unidades comenzará el producto.'} />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="18px" mt="20px">
              <FormField isInvalid={submitted && values.stock < 0} label={<>Unidades disponibles</>} help="Cantidad que está físicamente disponible para vender." error={<> Las existencias no pueden ser negativas. </>}>

                <Input type="number" min={0} value={values.stock} onChange={(event) => set('stock', Number(event.target.value))} />

              </FormField>
              <FormField isInvalid={submitted && Number(values.lowStockThreshold) < 0} label={<>Avisar cuando queden</>} help="Cuando las existencias sean iguales o menores a este número, el inventario mostrará una alerta.">

                <Input type="number" min={0} value={values.lowStockThreshold} onChange={(event) => set('lowStockThreshold', Number(event.target.value))} />

              </FormField>
            </SimpleGrid>
            <Flex mt="20px" p={{ base: '14px', md: '16px' }} bg={subtleBg} borderRadius="14px" justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="12px">
              <Box><Text fontWeight="800">Disponible para pedidos</Text><Text fontSize="sm" color={muted}>Al desactivarlo seguirá en el historial, pero no podrá agregarse a pedidos nuevos.</Text></Box>
              <ActiveSwitch id="product-available" label="Producto activo" isChecked={values.active} onChange={checked => set('active', checked)} />
            </Flex>
          </Card>
        </Stack>

        <Card p={{ base: '18px', md: '22px' }} position={{ xl: 'sticky' }} top={{ xl: '105px' }}>
          <Heading size="md" color={textColor}>Resumen</Heading>
          <Text color={muted} fontSize="sm" mt="4px">Revisá los valores antes de guardar.</Text>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 1 }} spacing="16px" mt="20px">
            <Summary label="Producto" value={values.description || 'Sin nombre'} />
            <Summary label="Categoría" value={values.category || 'Sin categoría'} />
            <Summary label="Precio de venta" value={crc(values.price)} strong />
            <Summary label="Ganancia por unidad" value={crc(margin)} tone={margin < 0 ? 'red.500' : 'green.500'} detail={`${marginPercent.toFixed(1)}% del precio`} />
            <Summary label="Valor del inventario" value={crc(inventoryValue)} detail={`${values.stock || 0} unidades al costo`} />
          </SimpleGrid>
          {Number(values.stock) <= Number(values.lowStockThreshold) && <HStack mt="18px" p="12px" bg="orange.50" color="orange.700" borderRadius="xl"><Icon as={MdWarning} /><Text fontSize="sm" fontWeight="700">El producto iniciará con stock bajo.</Text></HStack>}
        </Card>
      </SimpleGrid>

    </Form>
  );
}

function SectionTitle({ icon, title, description }: { icon: any; title: string; description: string }) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  return <HStack align="flex-start" spacing="12px"><Flex boxSize="42px" borderRadius="14px" bg="brand.50" color="brand.500" align="center" justify="center" flexShrink={0}><Icon as={icon} boxSize="22px" /></Flex><Box><Heading size="md">{title}</Heading><Text color={muted} fontSize="sm" mt="2px">{description}</Text></Box></HStack>;
}

function Summary({ label, value, detail, strong, tone }: { label: string; value: string; detail?: string; strong?: boolean; tone?: string }) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  return <Box borderBottomWidth={{ base: '1px', xl: '1px' }} borderColor={border} pb="12px" minW="0"><Text color={muted} fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing=".04em">{label}</Text><Text mt="3px" fontWeight={strong ? '900' : '700'} fontSize={strong ? 'xl' : 'md'} color={tone} overflowWrap="anywhere">{value}</Text>{detail && <Text color={muted} fontSize="xs">{detail}</Text>}</Box>;
}
