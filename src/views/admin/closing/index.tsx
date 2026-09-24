import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, AlertIcon, Badge, Box, Button, FormControl, FormLabel, Heading, Input, Select,
  SimpleGrid, Spinner, Stat, StatLabel, StatNumber, Tab, TabList, TabPanel, TabPanels,
  Table, Tbody, Td, Text, Textarea, Th, Thead, Tr, Tabs, useToast,
} from '@chakra-ui/react';
import { useAuth } from 'contexts/AuthContext';
import { ClosingItem, ClosingType, ExpenseItem } from 'interfaces/ClosingItem';
import { OrderItem } from 'interfaces/OrderItem';
import { Product } from 'interfaces/ProductItem';
import ClosingService from 'services/ClosingService';
import OrderService from 'services/OrderService';
import ProductService from 'services/ProductService';
import { availableOrders, cylinderSummary, expenseTotal, orderTotal, paymentTotals } from 'utils/closing';

const crc = (amount: number) => `₡${amount.toLocaleString('es-CR')}`;
const nowLocal = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};
const startToday = () => `${nowLocal().slice(0, 10)}T00:00`;
const TYPE_LABEL: Record<ClosingType, string> = { shift: 'Turno', profit: 'Utilidades', cylinder: 'Costo de cilindros' };

function Metric({ label, value }: { label: string; value: number }) {
  return <Stat p="4" bg="gray.50" borderRadius="xl"><StatLabel>{label}</StatLabel><StatNumber fontSize="xl">{crc(value)}</StatNumber></Stat>;
}

export default function Closings() {
  const { user, roles } = useAuth();
  const toast = useToast();
  const isAdmin = roles.includes('admin');
  const canCloseCylinders = isAdmin || roles.includes('colaborador');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [history, setHistory] = useState<ClosingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<ClosingType>('shift');
  const [from, setFrom] = useState(startToday());
  const [to, setTo] = useState(nowLocal());
  const [declared, setDeclared] = useState('');
  const [note, setNote] = useState('');
  const [expense, setExpense] = useState({ description: '', category: 'Operación', amount: '', occurredAt: nowLocal(), shift: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, expensesData, closingsData] = await Promise.all([
        OrderService.getAll(), ProductService.getAll(), ClosingService.getExpenses(), ClosingService.getAll(),
      ]);
      setOrders(ordersData); setProducts(productsData); setExpenses(expensesData);
      setHistory(closingsData.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (error) {
      toast({ title: 'No se pudieron cargar los datos.', status: 'error' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  const periodOrders = useMemo(() => availableOrders(orders, from, to), [orders, from, to]);
  const included = useMemo(() => type === 'cylinder'
    ? periodOrders.filter((order) => order.items.some((item) => products.some((product) => product.id === item.productId && product.category === 'Cilindros')))
    : periodOrders, [periodOrders, products, type]);
  const payments = useMemo(() => paymentTotals(included), [included]);
  const sales = included.reduce((sum, order) => sum + orderTotal(order), 0);
  const expensesInPeriod = expenseTotal(expenses, from, to);
  const cylinders = useMemo(() => cylinderSummary(included, products), [included, products]);
  const cylinderCost = cylinders.reduce((sum, line) => sum + line.totalCost, 0);
  const allCost = included.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return itemSum + Number(product?.costPrice || 0) * Number(item.quantity || 0);
  }, 0), 0);
  const expected = type === 'shift' ? payments.cash - expensesInPeriod : type === 'profit' ? sales - allCost - expensesInPeriod : cylinderCost;
  const declaredAmount = Number(declared || 0);
  const difference = declaredAmount - expected;

  const saveExpense = async () => {
    if (!expense.description.trim() || Number(expense.amount) <= 0) {
      toast({ title: 'Ingrese una descripción y un monto válido.', status: 'warning' }); return;
    }
    setSaving(true);
    try {
      await ClosingService.createExpense({ ...expense, amount: Number(expense.amount), occurredAt: new Date(expense.occurredAt).toISOString(), createdAt: new Date().toISOString(), createdBy: user?.uid || '' });
      setExpense({ description: '', category: 'Operación', amount: '', occurredAt: nowLocal(), shift: '' });
      toast({ title: 'Gasto registrado.', status: 'success' }); await load();
    } catch { toast({ title: 'No se pudo registrar el gasto.', status: 'error' }); } finally { setSaving(false); }
  };

  const confirm = async () => {
    if (!included.length) { toast({ title: 'No hay pedidos disponibles en el periodo.', status: 'warning' }); return; }
    if (type === 'profit' && !isAdmin) { toast({ title: 'Solo un administrador puede cerrar utilidades.', status: 'error' }); return; }
    if (type === 'cylinder' && !canCloseCylinders) { toast({ title: 'No tiene autorización para este corte.', status: 'error' }); return; }
    if (difference !== 0 && !note.trim()) { toast({ title: 'Explique la diferencia de caja antes de confirmar.', status: 'warning' }); return; }
    setSaving(true);
    const closing: ClosingItem = {
      type, status: 'confirmed', orderIds: included.map((order) => order.id), orderCodes: included.map((order) => order.orderCode),
      from: new Date(from).toISOString(), to: new Date(to).toISOString(), totalSales: sales, cashTotal: payments.cash,
      sinpeTotal: payments.sinpe, otherTotal: payments.other, expenseTotal: expensesInPeriod, costTotal: type === 'cylinder' ? cylinderCost : allCost,
      expectedAmount: expected, declaredAmount, difference, differenceNote: note.trim() || undefined,
      cylinderLines: type === 'cylinder' ? cylinders : undefined, createdAt: new Date().toISOString(), createdBy: user?.uid || '',
    };
    try {
      await ClosingService.confirm(closing); toast({ title: 'Corte confirmado y pedidos bloqueados.', status: 'success' });
      setDeclared(''); setNote(''); await load();
    } catch { toast({ title: 'No se pudo confirmar el corte.', status: 'error' }); } finally { setSaving(false); }
  };

  if (loading) return <Box pt="20"><Spinner size="xl" /></Box>;
  return <Box w="100%" pt={{ base: '180px', md: '80px' }}>
    <Heading size="lg" mb="1">Gastos y cortes</Heading>
    <Text color="gray.500" mb="6">Registre egresos, previsualice cada liquidación y consulte el historial.</Text>
    <Tabs colorScheme="brand" isLazy>
      <TabList overflowX="auto"><Tab>Gastos</Tab><Tab>Corte nuevo</Tab><Tab>Historial</Tab></TabList>
      <TabPanels>
        <TabPanel px="0">
          <Box bg="white" p="5" borderRadius="xl" mb="6">
            <Heading size="md" mb="4">Registrar gasto</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
              <FormControl isRequired><FormLabel>Descripción</FormLabel><Input value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} /></FormControl>
              <FormControl><FormLabel>Categoría</FormLabel><Select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}><option>Operación</option><option>Combustible</option><option>Mantenimiento</option><option>Otro</option></Select></FormControl>
              <FormControl isRequired><FormLabel>Monto</FormLabel><Input type="number" min="0" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel>Fecha y hora</FormLabel><Input type="datetime-local" value={expense.occurredAt} onChange={(e) => setExpense({ ...expense, occurredAt: e.target.value })} /></FormControl>
              <FormControl><FormLabel>Turno (opcional)</FormLabel><Input value={expense.shift} onChange={(e) => setExpense({ ...expense, shift: e.target.value })} placeholder="Ej. Mañana" /></FormControl>
            </SimpleGrid><Button mt="4" colorScheme="brand" isLoading={saving} onClick={saveExpense}>Guardar gasto</Button>
          </Box>
          <ExpenseTable expenses={expenses} />
        </TabPanel>
        <TabPanel px="0">
          <Box bg="white" p="5" borderRadius="xl">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
              <FormControl><FormLabel>Tipo de corte</FormLabel><Select value={type} onChange={(e) => setType(e.target.value as ClosingType)}><option value="shift">Turno</option>{isAdmin && <option value="profit">Utilidades</option>}{canCloseCylinders && <option value="cylinder">Costo de cilindros</option>}</Select></FormControl>
              <FormControl><FormLabel>Desde</FormLabel><Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} /></FormControl>
              <FormControl><FormLabel>Hasta</FormLabel><Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} /></FormControl>
            </SimpleGrid>
            <Heading size="md" mt="6" mb="3">Previsualización</Heading>
            <SimpleGrid columns={{ base: 2, lg: 4 }} spacing="3"><Metric label="Total vendido" value={sales} /><Metric label="Efectivo" value={payments.cash} /><Metric label="SINPE" value={payments.sinpe} /><Metric label="Otros métodos" value={payments.other} /><Metric label="Gastos" value={expensesInPeriod} />{type !== 'shift' && <Metric label="Costos" value={type === 'cylinder' ? cylinderCost : allCost} />}<Metric label="Monto esperado" value={expected} /><Metric label="Diferencia" value={difference} /></SimpleGrid>
            {type === 'cylinder' ? <CylinderTable lines={cylinders} /> : <OrderTable orders={included} />}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mt="5">
              <FormControl isRequired><FormLabel>Monto declarado</FormLabel><Input type="number" value={declared} onChange={(e) => setDeclared(e.target.value)} /></FormControl>
              <FormControl isRequired={difference !== 0}><FormLabel>Nota explicativa {difference !== 0 && '(obligatoria)'}</FormLabel><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></FormControl>
            </SimpleGrid>
            <Alert status="info" mt="4"><AlertIcon />Al confirmar, los {included.length} pedidos quedarán bloqueados y no podrán incluirse en otro corte.</Alert>
            <Button colorScheme="brand" mt="4" onClick={confirm} isLoading={saving}>Confirmar corte</Button>
          </Box>
        </TabPanel>
        <TabPanel px="0"><HistoryTable history={history} /></TabPanel>
      </TabPanels>
    </Tabs>
  </Box>;
}

function OrderTable({ orders }: { orders: OrderItem[] }) { return <Box overflowX="auto" mt="5"><Table size="sm"><Thead><Tr><Th>Pedido</Th><Th>Fecha</Th><Th>Cliente</Th><Th isNumeric>Total</Th></Tr></Thead><Tbody>{orders.map((o) => <Tr key={o.id}><Td>{o.orderCode}</Td><Td>{new Date(o.paidAt || o.requestDate).toLocaleString('es-CR')}</Td><Td>{o.client}</Td><Td isNumeric>{crc(orderTotal(o))}</Td></Tr>)}</Tbody></Table>{!orders.length && <Text p="4" color="gray.500">No hay pedidos pagados y sin cortar en este periodo.</Text>}</Box>; }
function ExpenseTable({ expenses }: { expenses: ExpenseItem[] }) { return <Box bg="white" p="5" borderRadius="xl" overflowX="auto"><Heading size="md" mb="3">Gastos registrados</Heading><Table size="sm"><Thead><Tr><Th>Fecha</Th><Th>Descripción</Th><Th>Categoría</Th><Th>Turno</Th><Th isNumeric>Monto</Th></Tr></Thead><Tbody>{[...expenses].sort((a,b) => b.occurredAt.localeCompare(a.occurredAt)).map((e) => <Tr key={e.id}><Td>{new Date(e.occurredAt).toLocaleString('es-CR')}</Td><Td>{e.description}</Td><Td>{e.category}</Td><Td>{e.shift || '—'}</Td><Td isNumeric>{crc(e.amount)}</Td></Tr>)}</Tbody></Table></Box>; }
function CylinderTable({ lines }: { lines: ClosingItem['cylinderLines'] }) { return <Box overflowX="auto" mt="5"><Table size="sm"><Thead><Tr><Th>Tipo</Th><Th>Tamaño</Th><Th isNumeric>Cantidad</Th><Th isNumeric>Costo unitario</Th><Th isNumeric>Costo total</Th></Tr></Thead><Tbody>{lines?.map((l) => <Tr key={l.productId}><Td>{l.type}</Td><Td>{l.size}</Td><Td isNumeric>{l.quantity}</Td><Td isNumeric>{crc(l.unitCost)}</Td><Td isNumeric>{crc(l.totalCost)}</Td></Tr>)}</Tbody></Table></Box>; }
function HistoryTable({ history }: { history: ClosingItem[] }) { return <Box bg="white" p="5" borderRadius="xl" overflowX="auto"><Table size="sm"><Thead><Tr><Th>Fecha</Th><Th>Tipo</Th><Th>Pedidos</Th><Th isNumeric>Esperado</Th><Th isNumeric>Declarado</Th><Th isNumeric>Diferencia</Th><Th>Nota</Th><Th>Estado</Th></Tr></Thead><Tbody>{history.map((c) => <Tr key={c.id}><Td>{new Date(c.createdAt).toLocaleString('es-CR')}</Td><Td>{TYPE_LABEL[c.type]}</Td><Td>{c.orderIds.length}</Td><Td isNumeric>{crc(c.expectedAmount)}</Td><Td isNumeric>{crc(c.declaredAmount)}</Td><Td isNumeric>{crc(c.difference)}</Td><Td>{c.differenceNote || '—'}</Td><Td><Badge colorScheme="green">Confirmado</Badge></Td></Tr>)}</Tbody></Table>{!history.length && <Text p="4">Aún no hay cortes confirmados.</Text>}</Box>; }
