import {
Badge, Box, Button, Flex, HStack, Icon, IconButton,
Input, Menu, MenuButton, MenuItem, MenuList, Modal,
ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
Select, SimpleGrid, Table, Tbody, Td,
Text, Th, Thead, Tr, useColorModeValue, useDisclosure, useToast
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import CategoryManager from 'components/category/CategoryManager';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import EmptyState from 'components/dataDisplay/EmptyState';
import FilterPanel from 'components/dataDisplay/FilterPanel';
import StatCard from 'components/dataDisplay/StatCard';
import ActiveSwitch from 'components/form/ActiveSwitch';
import Form from 'components/form/Form';
import FormActions from 'components/form/FormActions';
import FormField from 'components/form/FormField';
import PageHeader from 'components/layout/PageHeader';
import { usePageSearch } from 'contexts/PageSearchContext';
import useCategories from 'hooks/useCategories';
import { Product } from 'interfaces/ProductItem';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdAdd, MdArrowDownward, MdArrowUpward, MdEdit, MdInventory2, MdMoreVert, MdSettings, MdWarning } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import productService from 'services/ProductService';

const money = (value: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(value || 0);

export default function Products() {
  const { query: search } = usePageSearch();
  const { categories, reload: reloadCategories } = useCategories('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [adjusting, setAdjusting] = useState<Product>();
  const [adjustment, setAdjustment] = useState(0);
  const [saving, setSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const categoryManager = useDisclosure();
  const toast = useToast();
  const text = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const hover = useColorModeValue('gray.50', 'whiteAlpha.50');

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts((await productService.getAll()) as Product[]); }
    catch { toast({ title: 'No pudimos cargar el inventario', description: 'Verifique su conexión e inténtelo nuevamente.', status: 'error' }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const normalized = useMemo(() => products.map(product => ({
    ...product, category: product.category || 'Otros', costPrice: Number(product.costPrice || 0),
    stock: Number(product.stock || 0), active: product.active !== false,
  } as Product)), [products]);
  const availableCategories = useMemo(() => Array.from(new Set([...categories, ...normalized.map(product => product.category).filter(Boolean)])), [categories, normalized]);
  const filtered = useMemo(() => normalized.filter(product => {
    const term = search.toLocaleLowerCase();
    return (!term || product.description.toLocaleLowerCase().includes(term) || product.sku?.toLocaleLowerCase().includes(term))
      && (!category || product.category === category)
      && (!status || (status === 'active' ? product.active : !product.active));
  }), [normalized, search, category, status]);
  const lowStock = normalized.filter(p => p.stock <= Number(p.lowStockThreshold ?? 5));
  const inventoryValue = normalized.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  const openAdjustment = (product: Product) => { setAdjusting(product); setAdjustment(0); onOpen(); };
  const saveAdjustment = async () => {
    if (!adjusting || adjustment === 0) return;
    setSaving(true);
    try {
      const stock = await productService.adjustStock(adjusting.id, adjustment);
      setProducts(current => current.map(p => p.id === adjusting.id ? { ...p, stock } : p));
      toast({ title: 'Inventario actualizado', description: `${adjusting.description} ahora tiene ${stock} unidades.`, status: 'success' });
      onClose();
    } catch { toast({ title: 'No se pudo ajustar el inventario', status: 'error' }); }
    finally { setSaving(false); }
  };
  const toggleActive = async (product: Product) => {
    const updated = { ...product, active: !product.active, updatedAt: new Date().toISOString() };
    setProducts(current => current.map(p => p.id === product.id ? updated : p));
    try { await productService.edit(product.id, updated); }
    catch { setProducts(current => current.map(p => p.id === product.id ? product : p)); }
  };

  return (
    <Box pt={{ base: '150px', md: '80px' }} w="100%">
      <PageHeader title="Productos e inventario" description="Administre su catálogo, precios y existencias desde un solo lugar." action={<Button as={RouterLink} to="/admin/product/new" leftIcon={<MdAdd />} colorScheme="brand" size="lg">Nuevo producto</Button>} />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing="16px" mb="22px">
        <StatCard label="Productos activos" value={normalized.filter(p => p.active).length} help={`${normalized.length} productos registrados`} />
        <StatCard label="Unidades disponibles" value={normalized.reduce((sum, p) => sum + p.stock, 0).toLocaleString('es-CR')} help="En todas las categorías" />
        <StatCard label="Valor del inventario" value={money(inventoryValue)} help="Calculado al precio de costo" />
        <StatCard label="Stock bajo" value={lowStock.length} help={lowStock.length ? 'Productos requieren atención' : 'Inventario saludable'} icon={MdWarning} colorScheme={lowStock.length ? 'orange' : 'green'} />
      </SimpleGrid>

      <FilterPanel title="Filtros del inventario" description="El buscador superior filtra por nombre o SKU." activeCount={Number(Boolean(category)) + Number(Boolean(status))} onClear={() => { setCategory(''); setStatus(''); }} action={<Button leftIcon={<MdSettings />} variant="outline" borderRadius="xl" onClick={categoryManager.onOpen}>Administrar categorías</Button>}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          <Box><Text fontSize="xs" color={muted} fontWeight="800" mb={2} textTransform="uppercase">Categoría</Text><Select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas las categorías</option>{availableCategories.map(item => <option key={item}>{item}</option>)}</Select></Box>
          <Box><Text fontSize="xs" color={muted} fontWeight="800" mb={2} textTransform="uppercase">Estado</Text><Select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option></Select></Box>
        </SimpleGrid>
      </FilterPanel>

      <Card p="0" overflow="hidden">
        {loading ? <AsyncContent isLoading loadingLabel="Cargando inventario" /> : filtered.length === 0 ? <EmptyState icon={MdInventory2} title="No encontramos productos" description="Cambie los filtros o agregue un producto nuevo." /> : (
          <Box overflowX="auto"><Table variant="simple">
            <Thead><Tr><Th>Producto</Th><Th>Categoría</Th><Th isNumeric>Precio venta</Th><Th isNumeric>Costo</Th><Th>Disponible</Th><Th>Estado</Th><Th w="55px" /></Tr></Thead>
            <Tbody>{filtered.map(product => {
              const isLow = product.stock <= Number(product.lowStockThreshold ?? 5);
              return <Tr key={product.id} _hover={{ bg: hover }}>
                <Td><Text fontWeight="700" color={text}>{product.description}</Text><Text fontSize="xs" color={muted}>{product.sku || `ID ${product.id.slice(0, 8)}`}</Text></Td>
                <Td><Badge colorScheme="purple" borderRadius="full" px="9px" py="4px">{product.category}</Badge></Td>
                <Td isNumeric fontWeight="700" color={text}>{money(product.price)}</Td><Td isNumeric color={muted}>{money(product.costPrice)}</Td>
                <Td><HStack><Text fontWeight="800" color={isLow ? 'orange.500' : text}>{product.stock}</Text><Text fontSize="xs" color={muted}>unid.</Text>{isLow && <Icon as={MdWarning} color="orange.400" />}</HStack></Td>
                <Td><ActiveSwitch id={`product-${product.id}-active`} label={product.active ? 'Activo' : 'Inactivo'} isChecked={product.active} onChange={() => toggleActive(product)} /></Td>
                <Td><Menu placement="bottom-end"><MenuButton as={IconButton} aria-label="Acciones" icon={<MdMoreVert />} variant="ghost" /><MenuList><MenuItem icon={<MdInventory2 />} onClick={() => openAdjustment(product)}>Ajustar inventario</MenuItem><MenuItem as={RouterLink} to={`/admin/product/edit/${product.id}`} icon={<MdEdit />}>Editar producto</MenuItem></MenuList></Menu></Td>
              </Tr>;
            })}</Tbody>
          </Table></Box>
        )}
        <Flex p="16px 20px" borderTopWidth="1px" borderColor={border} justify="space-between"><Text fontSize="sm" color={muted}>Mostrando {filtered.length} de {normalized.length} productos</Text></Flex>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered><ModalOverlay /><ModalContent><Form isSubmitting={saving} isDisabled={!Number.isInteger(adjustment) || adjustment === 0 || Number(adjusting?.stock || 0) + adjustment < 0} onFormSubmit={event => { event.preventDefault(); saveAdjustment(); }}><ModalHeader>Ajustar inventario</ModalHeader><ModalCloseButton /><ModalBody><Text fontWeight="700" color={text}>{adjusting?.description}</Text><Text color={muted} fontSize="sm" mb="20px">Existencia actual: {adjusting?.stock || 0} unidades</Text><FormField label="Cantidad del ajuste"><Input type="number" step="1" value={adjustment} onChange={e => setAdjustment(Number(e.target.value))} /></FormField><HStack mt="12px" spacing="8px"><Button size="sm" leftIcon={<MdArrowUpward />} onClick={() => setAdjustment(Math.abs(Math.trunc(adjustment) || 1))}>Entrada</Button><Button size="sm" leftIcon={<MdArrowDownward />} onClick={() => setAdjustment(-Math.abs(Math.trunc(adjustment) || 1))}>Salida</Button></HStack><Text fontSize="sm" color={Number(adjusting?.stock || 0) + adjustment < 0 ? 'red.500' : muted} mt="16px">Nuevo total: <b>{Number(adjusting?.stock || 0) + adjustment} unidades</b></Text></ModalBody><ModalFooter display="block"><FormActions submitLabel="Guardar ajuste" isDisabled={!Number.isInteger(adjustment) || adjustment === 0 || Number(adjusting?.stock || 0) + adjustment < 0} isLoading={saving} onCancel={onClose} showCancel /></ModalFooter></Form></ModalContent></Modal>
      <CategoryManager kind="products" categories={categories} isOpen={categoryManager.isOpen} onClose={categoryManager.onClose} onSaved={reloadCategories} />
    </Box>
  );
}
