import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge, Box, Button, Center, Divider, Flex, Heading, HStack, Icon, IconButton,
  Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuItem, MenuList, Modal,
  ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Select, SimpleGrid, Spinner, Stat, StatLabel, StatNumber, Switch, Table, Tbody, Td,
  Text, Th, Thead, Tr, useColorModeValue, useDisclosure, useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdAdd, MdArrowDownward, MdArrowUpward, MdEdit, MdInventory2, MdMoreVert, MdSearch, MdWarning } from 'react-icons/md';
import Card from 'components/card/Card';
import productService from 'services/ProductService';
import { Product, PRODUCT_CATEGORIES } from 'interfaces/ProductItem';

const money = (value: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(value || 0);

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [adjusting, setAdjusting] = useState<Product>();
  const [adjustment, setAdjustment] = useState(0);
  const [saving, setSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const text = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const surface = useColorModeValue('white', 'navy.800');
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
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="18px" mb="24px">
        <Box><Heading color={text} fontSize={{ base: '28px', md: '34px' }}>Productos e inventario</Heading><Text color={muted} mt="6px">Administre su catálogo, precios y existencias desde un solo lugar.</Text></Box>
        <Button as={RouterLink} to="/admin/product/new" leftIcon={<MdAdd />} colorScheme="brand" size="lg">Nuevo producto</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing="16px" mb="22px">
        <Card p="20px"><Stat><StatLabel color={muted}>Productos activos</StatLabel><StatNumber color={text}>{normalized.filter(p => p.active).length}</StatNumber><Text fontSize="xs" color={muted}>{normalized.length} productos registrados</Text></Stat></Card>
        <Card p="20px"><Stat><StatLabel color={muted}>Unidades disponibles</StatLabel><StatNumber color={text}>{normalized.reduce((sum, p) => sum + p.stock, 0).toLocaleString('es-CR')}</StatNumber><Text fontSize="xs" color={muted}>En todas las categorías</Text></Stat></Card>
        <Card p="20px"><Stat><StatLabel color={muted}>Valor del inventario</StatLabel><StatNumber color={text} fontSize="2xl">{money(inventoryValue)}</StatNumber><Text fontSize="xs" color={muted}>Calculado al precio de costo</Text></Stat></Card>
        <Card p="20px" borderWidth={lowStock.length ? '1px' : '0'} borderColor="orange.200"><Stat><HStack><Icon as={MdWarning} color={lowStock.length ? 'orange.400' : 'green.400'} /><StatLabel color={muted}>Stock bajo</StatLabel></HStack><StatNumber color={lowStock.length ? 'orange.500' : text}>{lowStock.length}</StatNumber><Text fontSize="xs" color={muted}>{lowStock.length ? 'Productos requieren atención' : 'Inventario saludable'}</Text></Stat></Card>
      </SimpleGrid>

      <Card p="0" overflow="hidden">
        <Flex p="20px" gap="12px" wrap="wrap" align="center">
          <InputGroup flex="1" minW={{ base: '100%', md: '280px' }}><InputLeftElement pointerEvents="none"><MdSearch color="#A0AEC0" /></InputLeftElement><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU..." bg={surface} /></InputGroup>
          <Select value={category} onChange={e => setCategory(e.target.value)} maxW={{ base: '100%', md: '210px' }}><option value="">Todas las categorías</option>{PRODUCT_CATEGORIES.map(item => <option key={item}>{item}</option>)}</Select>
          <Select value={status} onChange={e => setStatus(e.target.value)} maxW={{ base: '100%', md: '170px' }}><option value="">Todos los estados</option><option value="active">Activos</option><option value="inactive">Inactivos</option></Select>
        </Flex>
        <Divider borderColor={border} />
        {loading ? <Center py="70px"><Spinner size="xl" color="brand.500" /></Center> : filtered.length === 0 ? <Center py="70px" flexDirection="column"><Icon as={MdInventory2} boxSize="44px" color="gray.300" /><Text fontWeight="700" mt="12px" color={text}>No encontramos productos</Text><Text color={muted} fontSize="sm">Cambie los filtros o agregue un producto nuevo.</Text></Center> : (
          <Box overflowX="auto"><Table variant="simple">
            <Thead><Tr><Th>Producto</Th><Th>Categoría</Th><Th isNumeric>Precio venta</Th><Th isNumeric>Costo</Th><Th>Disponible</Th><Th>Estado</Th><Th w="55px" /></Tr></Thead>
            <Tbody>{filtered.map(product => {
              const isLow = product.stock <= Number(product.lowStockThreshold ?? 5);
              return <Tr key={product.id} _hover={{ bg: hover }}>
                <Td><Text fontWeight="700" color={text}>{product.description}</Text><Text fontSize="xs" color={muted}>{product.sku || `ID ${product.id.slice(0, 8)}`}</Text></Td>
                <Td><Badge colorScheme="purple" borderRadius="full" px="9px" py="4px">{product.category}</Badge></Td>
                <Td isNumeric fontWeight="700" color={text}>{money(product.price)}</Td><Td isNumeric color={muted}>{money(product.costPrice)}</Td>
                <Td><HStack><Text fontWeight="800" color={isLow ? 'orange.500' : text}>{product.stock}</Text><Text fontSize="xs" color={muted}>unid.</Text>{isLow && <Icon as={MdWarning} color="orange.400" />}</HStack></Td>
                <Td><HStack><Switch size="sm" colorScheme="green" isChecked={product.active} onChange={() => toggleActive(product)} /><Text fontSize="sm">{product.active ? 'Activo' : 'Inactivo'}</Text></HStack></Td>
                <Td><Menu placement="bottom-end"><MenuButton as={IconButton} aria-label="Acciones" icon={<MdMoreVert />} variant="ghost" /><MenuList><MenuItem icon={<MdInventory2 />} onClick={() => openAdjustment(product)}>Ajustar inventario</MenuItem><MenuItem as={RouterLink} to={`/admin/product/edit/${product.id}`} icon={<MdEdit />}>Editar producto</MenuItem></MenuList></Menu></Td>
              </Tr>;
            })}</Tbody>
          </Table></Box>
        )}
        <Flex p="16px 20px" borderTopWidth="1px" borderColor={border} justify="space-between"><Text fontSize="sm" color={muted}>Mostrando {filtered.length} de {normalized.length} productos</Text></Flex>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered><ModalOverlay /><ModalContent><ModalHeader>Ajustar inventario</ModalHeader><ModalCloseButton /><ModalBody><Text fontWeight="700" color={text}>{adjusting?.description}</Text><Text color={muted} fontSize="sm" mb="20px">Existencia actual: {adjusting?.stock || 0} unidades</Text><Text fontSize="sm" fontWeight="600" mb="8px">Cantidad del ajuste</Text><Input type="number" value={adjustment} onChange={e => setAdjustment(Number(e.target.value))} /><HStack mt="12px" spacing="8px"><Button size="sm" leftIcon={<MdArrowUpward />} onClick={() => setAdjustment(Math.abs(adjustment || 1))}>Entrada</Button><Button size="sm" leftIcon={<MdArrowDownward />} onClick={() => setAdjustment(-Math.abs(adjustment || 1))}>Salida</Button></HStack><Text fontSize="sm" color={muted} mt="16px">Nuevo total: <b>{Math.max(0, Number(adjusting?.stock || 0) + adjustment)} unidades</b></Text></ModalBody><ModalFooter><Button variant="ghost" mr="8px" onClick={onClose}>Cancelar</Button><Button colorScheme="brand" isDisabled={adjustment === 0} isLoading={saving} onClick={saveAdjustment}>Guardar ajuste</Button></ModalFooter></ModalContent></Modal>
    </Box>
  );
}
