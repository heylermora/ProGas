import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AddIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import {
  Alert, AlertIcon, Badge, Box, Button, Center, Divider, Flex, FormControl,
  FormLabel, Heading, HStack, IconButton, Input, NumberInput, NumberInputField,
  Select, SimpleGrid, Spinner, Stat, StatLabel, StatNumber, Tab, TabList,
  TabPanel, TabPanels, Table, Tbody, Td, Text, Th, Thead, Tr, Tabs,
  useColorModeValue, useToast, VStack,
} from '@chakra-ui/react';
import { MdSave } from 'react-icons/md';
import OperationsService, {
  Closing, OperationKind, OperationRow, Provider,
} from 'services/OperationsService';

const KINDS: OperationKind[] = ['Sinpe', 'Tarjeta', 'Proveedor'];
const today = () => new Date().toISOString().slice(0, 10);
const currency = (value: number) => `₡${value.toLocaleString('es-CR', { maximumFractionDigits: 2 })}`;
const newRow = (kind: OperationKind): OperationRow => ({
  id: `${Date.now()}-${Math.random()}`,
  kind,
  description: '',
  amount: 0,
});

export default function Operations() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const toast = useToast();
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<OperationRow[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [closings, setClosings] = useState<Closing[]>([]);
  const [providerName, setProviderName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [historyMonth, setHistoryMonth] = useState(today().slice(0, 7));
  const [historyDay, setHistoryDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [providerData, closingData] = await Promise.all([
        OperationsService.getProviders(), OperationsService.getClosings(),
      ]);
      setProviders(providerData.sort((a, b) => a.name.localeCompare(b.name)));
      setClosings(closingData.sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      toast({ title: 'No se pudieron cargar las operaciones.', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const totals = useMemo(() => KINDS.reduce((result, kind) => ({
    ...result,
    [kind]: rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + Number(row.amount || 0), 0),
  }), {} as Record<OperationKind, number>), [rows]);
  const grandTotal = KINDS.reduce((sum, kind) => sum + totals[kind], 0);

  const addOperation = (kind: OperationKind) => {
    if (kind === 'Proveedor' && !selectedProvider) {
      toast({ title: 'Seleccione un proveedor.', status: 'warning' });
      return;
    }
    setRows((current) => [...current, { ...newRow(kind), description: kind === 'Proveedor' ? selectedProvider : '' }]);
  };

  const updateRow = (id: string, field: 'description' | 'amount', value: string | number) =>
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  const removeRow = (id: string) => setRows((current) => current.filter((row) => row.id !== id));

  const addProvider = async () => {
    const name = providerName.trim();
    if (!name || providers.some((provider) => provider.name.toLowerCase() === name.toLowerCase())) return;
    try {
      const result = await OperationsService.addProvider(name);
      setProviders((current) => [...current, { id: result.id, name }].sort((a, b) => a.name.localeCompare(b.name)));
      setProviderName('');
    } catch { toast({ title: 'No se pudo agregar el proveedor.', status: 'error' }); }
  };

  const deleteProvider = async (provider: Provider) => {
    if (!provider.id) return;
    try {
      await OperationsService.deleteProvider(provider.id);
      setProviders((current) => current.filter((item) => item.id !== provider.id));
      if (selectedProvider === provider.name) setSelectedProvider('');
    } catch { toast({ title: 'No se pudo eliminar el proveedor.', status: 'error' }); }
  };

  const save = async () => {
    if (!rows.length || rows.some((row) => !row.description.trim() || row.amount <= 0)) {
      toast({ title: 'Complete la descripción y un monto mayor a cero en cada fila.', status: 'warning' });
      return;
    }
    const closing: Closing = { date, createdAt: new Date().toISOString(), rows, totals, grandTotal };
    setSaving(true);
    try {
      const result = await OperationsService.saveClosing(closing);
      setClosings((current) => [{ ...closing, id: result.id }, ...current]);
      setRows([]);
      toast({ title: 'Cierre guardado correctamente.', status: 'success' });
    } catch { toast({ title: 'No se pudo guardar el cierre.', status: 'error' }); }
    finally { setSaving(false); }
  };

  const filteredClosings = closings.filter((closing) =>
    (!historyMonth || closing.date.startsWith(historyMonth)) && (!historyDay || closing.date === historyDay)
  );

  const rowsTable = (kind: OperationKind) => {
    const kindRows = rows.filter((row) => row.kind === kind);
    return (
      <Box overflowX="auto" mt="4">
        <Table size="sm">
          <Thead><Tr><Th>{kind === 'Proveedor' ? 'Proveedor' : 'Descripción / referencia'}</Th><Th isNumeric>Monto</Th><Th w="45px" /></Tr></Thead>
          <Tbody>
            {kindRows.map((row) => <Tr key={row.id}>
              <Td><Input size="sm" value={row.description} isReadOnly={kind === 'Proveedor'} placeholder="Ej. referencia o detalle" onChange={(e) => updateRow(row.id, 'description', e.target.value)} /></Td>
              <Td><NumberInput size="sm" min={0} value={row.amount || ''} onChange={(_, value) => updateRow(row.id, 'amount', Number.isNaN(value) ? 0 : value)}><NumberInputField textAlign="right" placeholder="0" /></NumberInput></Td>
              <Td><IconButton size="sm" variant="ghost" colorScheme="red" aria-label="Eliminar fila" icon={<DeleteIcon />} onClick={() => removeRow(row.id)} /></Td>
            </Tr>)}
          </Tbody>
        </Table>
        {!kindRows.length && <Text py="7" textAlign="center" color={muted} fontSize="sm">Todavía no hay registros. Agréguelos directamente a la tabla.</Text>}
      </Box>
    );
  };

  if (loading) return <Center minH="300px"><Spinner size="xl" /></Center>;

  return <Box w="100%" pt={{ base: '180px', md: '80px' }} maxW="1200px" mx="auto">
    <Heading color={textColor} size="lg">Operaciones</Heading>
    <Text color={muted} mt="1" mb="5">Registre los movimientos del día, revise el total y guarde un único cierre.</Text>

    <Box bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Flex justify="space-between" align={{ base: 'stretch', md: 'end' }} direction={{ base: 'column', md: 'row' }} gap="4" mb="5">
        <FormControl maxW={{ md: '220px' }}><FormLabel>Fecha del cierre</FormLabel><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></FormControl>
        <Badge alignSelf={{ md: 'center' }} colorScheme="blue" p="2" borderRadius="md">{rows.length} movimientos sin guardar</Badge>
      </Flex>

      <Tabs colorScheme="brand" isLazy>
        <TabList overflowX="auto"><Tab>SINPE</Tab><Tab>Tarjeta</Tab><Tab>Proveedores</Tab></TabList>
        <TabPanels>
          <TabPanel px="0"><Button size="sm" leftIcon={<AddIcon />} onClick={() => addOperation('Sinpe')}>Agregar SINPE</Button>{rowsTable('Sinpe')}</TabPanel>
          <TabPanel px="0"><Button size="sm" leftIcon={<AddIcon />} onClick={() => addOperation('Tarjeta')}>Agregar tarjeta</Button>{rowsTable('Tarjeta')}</TabPanel>
          <TabPanel px="0">
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
              <Box>
                <Text fontWeight="700" mb="2">Lista de proveedores</Text>
                <HStack><Input value={providerName} placeholder="Nombre del proveedor" onChange={(e) => setProviderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addProvider()} /><IconButton colorScheme="brand" aria-label="Agregar proveedor" icon={<AddIcon />} onClick={addProvider} /></HStack>
                <VStack align="stretch" mt="3" maxH="180px" overflowY="auto">
                  {providers.map((provider) => <Flex key={provider.id || provider.name} borderWidth="1px" borderColor={border} borderRadius="md" px="3" py="2" align="center"><Text flex="1">{provider.name}</Text><IconButton size="xs" variant="ghost" colorScheme="red" aria-label={`Eliminar ${provider.name}`} icon={<DeleteIcon />} onClick={() => deleteProvider(provider)} /></Flex>)}
                  {!providers.length && <Text color={muted} fontSize="sm">Agregue el primer proveedor.</Text>}
                </VStack>
              </Box>
              <Box><Text fontWeight="700" mb="2">Agregar a la tabla</Text><HStack><Select placeholder="Seleccione un proveedor" value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>{providers.map((provider) => <option key={provider.id || provider.name}>{provider.name}</option>)}</Select><Button flexShrink={0} leftIcon={<AddIcon />} onClick={() => addOperation('Proveedor')}>Agregar</Button></HStack></Box>
            </SimpleGrid>
            {rowsTable('Proveedor')}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Divider my="5" />
      <Heading size="sm" mb="3">Resumen del cierre actual</Heading>
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
        {KINDS.map((kind) => <Stat key={kind} borderWidth="1px" borderColor={border} borderRadius="xl" p="3"><StatLabel>{kind}</StatLabel><StatNumber fontSize="xl">{currency(totals[kind])}</StatNumber></Stat>)}
        <Stat bg="brand.500" color="white" borderRadius="xl" p="3"><StatLabel>Total general</StatLabel><StatNumber fontSize="xl">{currency(grandTotal)}</StatNumber></Stat>
      </SimpleGrid>
      <Flex justify="flex-end" mt="5"><Button colorScheme="brand" leftIcon={<MdSave />} isLoading={saving} isDisabled={!rows.length} onClick={save}>Guardar cierre</Button></Flex>
    </Box>

    <Box bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl" p={{ base: 4, md: 6 }} mt="6">
      <Heading size="md">Historial de cierres</Heading>
      <Text color={muted} fontSize="sm" mb="4">Consulte los cierres por mes o seleccione un día específico.</Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" maxW="520px" mb="5">
        <FormControl><FormLabel>Mes</FormLabel><Input type="month" value={historyMonth} onChange={(e) => { setHistoryMonth(e.target.value); setHistoryDay(''); }} /></FormControl>
        <FormControl><FormLabel>Día</FormLabel><Input type="date" value={historyDay} onChange={(e) => setHistoryDay(e.target.value)} /></FormControl>
      </SimpleGrid>
      {!filteredClosings.length ? <Alert status="info" borderRadius="lg"><AlertIcon />No hay cierres para la fecha seleccionada.</Alert> :
        <VStack align="stretch" spacing="3">{filteredClosings.map((closing) => <Box key={closing.id || closing.createdAt} borderWidth="1px" borderColor={border} borderRadius="xl" p="4"><Flex justify="space-between" wrap="wrap" gap="2"><Box><Text fontWeight="800">{new Date(`${closing.date}T12:00:00`).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text><Text color={muted} fontSize="sm">{closing.rows.length} movimientos</Text></Box><Text fontSize="xl" fontWeight="800">{currency(closing.grandTotal)}</Text></Flex><HStack mt="3" spacing="4" wrap="wrap">{KINDS.map((kind) => <Text key={kind} fontSize="sm"><b>{kind}:</b> {currency(closing.totals[kind] || 0)}</Text>)}</HStack></Box>)}</VStack>}
    </Box>
  </Box>;
}
