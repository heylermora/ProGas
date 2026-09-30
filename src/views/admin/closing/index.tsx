import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, AlertIcon, Badge, Box, Button, FormControl, FormLabel, Heading, Input, Select,
  SimpleGrid, Stat, StatLabel, StatNumber, Tab, TabList, TabPanel, TabPanels,
  Table, Tbody, Td, Text, Textarea, Th, Thead, Tr, Tabs, useToast,
} from '@chakra-ui/react';
import { useAuth } from 'contexts/AuthContext';
import { ClosingItem, ClosingType, ExpenseItem } from 'interfaces/ClosingItem';
import { OrderItem } from 'interfaces/OrderItem';
import { Product } from 'interfaces/ProductItem';
import ClosingService from 'services/ClosingService';
import OrderService from 'services/OrderService';
import ProductService from 'services/ProductService';
import { availableExpenses, availableOrders, cylinderSummary, orderFingerprint, orderTotal, paymentTotals } from 'utils/closing';
import HelpLabel from 'components/form/HelpLabel';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import PageHeader from 'components/layout/PageHeader';
import UserService from 'services/UserService';
import UserItem from 'interfaces/UserItem';
import Balance from 'views/admin/order/balance';
import { isOrderPaid } from 'utils/order';
import { parseStoredDate } from 'utils/closing';

const crc = (amount: number) => `₡${amount.toLocaleString('es-CR')}`;
const nowLocal = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};
const today = () => nowLocal().slice(0, 10);
const TYPE_LABEL: Record<ClosingType, string> = { shift: 'Turno', profit: 'Utilidades', cylinder: 'Costo de cilindros' };

function Metric({ label, value }: { label: string; value: number }) {
  return <Stat p="4" bg="gray.50" borderRadius="xl"><StatLabel>{label}</StatLabel><StatNumber fontSize="xl">{crc(value)}</StatNumber></Stat>;
}

export default function Closings() {
  const { user, roles, displayName } = useAuth();
  const toast = useToast();
  const isAdmin = roles.includes('admin');
  const canCloseCylinders = isAdmin || roles.includes('colaborador');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [history, setHistory] = useState<ClosingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState<UserItem[]>([]);
  const [responsibleId, setResponsibleId] = useState('');
  const [type, setType] = useState<ClosingType>('shift');
  const [closingDate, setClosingDate] = useState(today());
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const lastCylinderClosing = history.find(item => item.type === 'cylinder');
  const cylinderStart = lastCylinderClosing?.to || orders.map(order => order.paidAt || order.requestDate).filter(Boolean).sort()[0] || nowLocal();
  const from = type === 'cylinder' ? cylinderStart : fromTime ? `${closingDate}T${fromTime}` : '';
  const to = type === 'cylinder' ? nowLocal() : toTime ? `${closingDate}T${toTime}` : '';
  const [declared, setDeclared] = useState('');
  const [note, setNote] = useState('');
  const [expense, setExpense] = useState({ description: '', category: 'Operación', amount: '', occurredAt: nowLocal() });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, expensesData, closingsData] = await Promise.all([
        OrderService.getAllPages(), ProductService.getAllPages(), ClosingService.getExpenses(), ClosingService.getAll(),
      ]);
      setOrders(ordersData); setProducts(productsData); setExpenses(expensesData);
      setHistory(closingsData.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (error) {
      toast({ title: 'No se pudieron cargar los datos.', status: 'error' });
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!isAdmin) setResponsibleId(user?.uid || ''); }, [isAdmin, user?.uid]);
  useEffect(() => { if (isAdmin) UserService.getAll().then(users => setCollaborators(users.filter(item => item.active !== false && item.roles?.includes('colaborador')))).catch(() => setCollaborators([])); }, [isAdmin]);
  const responsible = isAdmin ? collaborators.find(item => item.userId === responsibleId) : undefined;
  const responsibleName = responsible?.name || displayName || user?.email || 'Colaborador';
  const periodOrders = useMemo(() => {
    if (!from || !to) return [];
    if (type !== 'cylinder') return availableOrders(orders, from, to);
    const start = parseStoredDate(from); const end = parseStoredDate(to);
    return orders.filter(order => isOrderPaid(order.status) && !order.cylinderClosingId && parseStoredDate(order.paidAt || order.requestDate) >= start && parseStoredDate(order.paidAt || order.requestDate) <= end);
  }, [orders, from, to, type]);
  const included = useMemo(() => type === 'cylinder'
    ? periodOrders.filter((order) => cylinderSummary([order], products).length > 0)
    : periodOrders, [periodOrders, products, type]);
  const payments = useMemo(() => paymentTotals(included), [included]);
  const sales = included.reduce((sum, order) => sum + orderTotal(order), 0);
  const includedExpenses = useMemo(() => from && to ? availableExpenses(expenses, from, to) : [], [expenses, from, to]);
  const expensesInPeriod = includedExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const cylinders = useMemo(() => cylinderSummary(included, products), [included, products]);
  const cylinderCost = cylinders.reduce((sum, line) => sum + line.totalCost, 0);
  const allCost = included.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => {
    return itemSum + Number(item.unitCost || 0) * Number(item.quantity || 0);
  }, 0), 0);
  const expected = type === 'shift' ? payments.cash - expensesInPeriod : type === 'profit' ? sales - allCost - expensesInPeriod : cylinderCost;
  const declaredAmount = type === 'cylinder' ? expected : Number(declared || 0);
  const difference = declaredAmount - expected;

  const saveExpense = async () => {
    if (!expense.description.trim() || Number(expense.amount) <= 0) {
      toast({ title: 'Ingrese una descripción y un monto válido.', status: 'warning' }); return;
    }
    if (isAdmin && !responsibleId) { toast({ title: 'Seleccioná el colaborador responsable.', status: 'warning' }); return; }
    setSaving(true);
    try {
      await ClosingService.createExpense({ ...expense, amount: Number(expense.amount), occurredAt: new Date(expense.occurredAt).toISOString(), createdAt: new Date().toISOString(), createdBy: isAdmin ? responsibleId : user?.uid || '', createdByName: responsibleName });
      setExpense({ description: '', category: 'Operación', amount: '', occurredAt: nowLocal() });
      toast({ title: 'Gasto registrado.', status: 'success' }); await load();
    } catch { toast({ title: 'No se pudo registrar el gasto.', status: 'error' }); } finally { setSaving(false); }
  };

  const confirm = async () => {
    if (type === 'shift' && (!fromTime || !toTime)) { toast({ title: 'Seleccioná la hora de inicio y fin del turno.', status: 'warning' }); return; }
    if (new Date(from).getTime() >= new Date(to).getTime()) { toast({ title: 'La hora final debe ser posterior a la hora inicial.', status: 'warning' }); return; }
    if (isAdmin && !responsibleId) { toast({ title: 'Seleccioná el colaborador responsable.', status: 'warning' }); return; }
    if (!included.length) { toast({ title: 'No hay pedidos disponibles en el periodo.', status: 'warning' }); return; }
    if (type === 'cylinder' && !canCloseCylinders) { toast({ title: 'No tiene autorización para este corte.', status: 'error' }); return; }
    if (type === 'shift' && difference !== 0 && !note.trim()) { toast({ title: 'Explique la diferencia de caja antes de confirmar.', status: 'warning' }); return; }
    setSaving(true);
    const optionalFields = {
      ...(note.trim() ? { differenceNote: note.trim() } : {}),
      ...(type === 'cylinder' ? { cylinderLines: cylinders } : {}),
    };
    const closing: ClosingItem = {
      type, status: 'confirmed', orderIds: included.map((order) => order.id), orderCodes: included.map((order) => order.orderCode),
      orderFingerprints: Object.fromEntries(included.map((order) => [order.id, orderFingerprint(order)])),
      expenseIds: type === 'cylinder' ? [] : includedExpenses.map((item) => item.id).filter((id): id is string => Boolean(id)),
      from: new Date(from).toISOString(), to: new Date(to).toISOString(), totalSales: sales, cashTotal: payments.cash,
      sinpeTotal: payments.sinpe, otherTotal: payments.other, expenseTotal: type === 'cylinder' ? 0 : expensesInPeriod, costTotal: type === 'cylinder' ? cylinderCost : allCost,
      expectedAmount: expected, declaredAmount, difference, ...optionalFields,
      createdAt: new Date().toISOString(), createdBy: isAdmin ? responsibleId : user?.uid || '', createdByName: responsibleName,
    };
    try {
      await ClosingService.confirm(closing); toast({ title: 'Corte confirmado y pedidos bloqueados.', status: 'success' });
      setDeclared(''); setNote(''); await load();
    } catch (error) { toast({ title: 'No se pudo confirmar el corte.', description: error instanceof Error ? error.message : 'Actualizá la previsualización e intentá nuevamente.', status: 'error' }); } finally { setSaving(false); }
  };

  if (loading) return <AsyncContent isLoading loadingLabel="Cargando cortes" />;
  return <Box w="100%" pt={{ base: '180px', md: '80px' }}>
    <PageHeader title="Finanzas" description="Registrá gastos, cerrá turnos y revisá el balance semanal desde un solo lugar." />
    <Alert status="info" mb="5" borderRadius="xl"><AlertIcon /><Box><Text fontWeight="800">¿Por dónde empezar?</Text><Text fontSize="sm">Primero registrá los gastos. Al terminar un turno, abrí “Corte nuevo”, elegí el periodo, contá el dinero recibido y escribí ese valor en “Monto declarado”.</Text></Box></Alert>
    <Tabs colorScheme="brand" isLazy>
      <TabList overflowX="auto"><Tab>Gastos</Tab><Tab>Cortes</Tab><Tab>Balance semanal</Tab><Tab>Historial</Tab></TabList>
      <TabPanels>
        <TabPanel px="0">
          <Box bg="white" p="5" borderRadius="xl" mb="6">
            <Heading size="md" mb="4">Registrar gasto</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
              <FormControl isRequired><HelpLabel help="Indicá en qué se utilizó el dinero; por ejemplo, combustible o mantenimiento." required>Descripción</HelpLabel><Input value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} /></FormControl>
              <FormControl><HelpLabel help="Agrupa gastos similares para que el historial sea más fácil de revisar.">Categoría</HelpLabel><Select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}><option>Operación</option><option>Combustible</option><option>Mantenimiento</option><option>Otro</option></Select></FormControl>
              <FormControl isRequired><HelpLabel help="Monto exacto que salió de caja. Se resta del efectivo esperado en el corte." required>Monto</HelpLabel><Input type="number" min="0" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} /></FormControl>
              <FormControl isRequired><HelpLabel help="Momento real del gasto. Define en cuál corte será incluido." required>Fecha y hora</HelpLabel><Input type="datetime-local" value={expense.occurredAt} onChange={(e) => setExpense({ ...expense, occurredAt: e.target.value })} /></FormControl>
              <ResponsibleControl isAdmin={isAdmin} collaborators={collaborators} responsibleId={responsibleId} responsibleName={responsibleName} onChange={setResponsibleId} />
            </SimpleGrid><Button mt="4" colorScheme="brand" isLoading={saving} onClick={saveExpense}>Guardar gasto</Button>
          </Box>
          <ExpenseTable expenses={expenses} />
        </TabPanel>
        <TabPanel px="0">
          <Box bg="white" p="5" borderRadius="xl">
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing="4">
              <FormControl><HelpLabel help="Turno liquida caja y pedidos; cilindros acumula las ventas desde su último corte.">Tipo de corte</HelpLabel><Select value={type} onChange={(e) => setType(e.target.value as ClosingType)}><option value="shift">Turno</option>{canCloseCylinders && <option value="cylinder">Cilindros acumulados</option>}</Select></FormControl>
              {type === 'shift' ? <><FormControl><FormLabel>Fecha del turno</FormLabel><Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} /></FormControl><FormControl isRequired><HelpLabel help="No se completa automáticamente para evitar incluir ventas de otro turno." required>Hora de inicio</HelpLabel><Input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} /></FormControl><FormControl isRequired><HelpLabel help="Debe ser posterior a la hora inicial del mismo día." required>Hora de fin</HelpLabel><Input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} /></FormControl></> : <Box gridColumn={{ md: 'span 3' }} p="3" bg="purple.50" borderRadius="xl"><Text fontWeight="800">Periodo acumulado de cilindros</Text><Text fontSize="sm">Desde {new Date(from).toLocaleString('es-CR')} hasta ahora. El siguiente corte continuará desde este punto.</Text></Box>}
            </SimpleGrid>
            <Box mt="4"><ResponsibleControl isAdmin={isAdmin} collaborators={collaborators} responsibleId={responsibleId} responsibleName={responsibleName} onChange={setResponsibleId} /></Box>
            <Heading size="md" mt="6" mb="3">Previsualización</Heading>
            <SimpleGrid columns={{ base: 2, lg: 4 }} spacing="3"><Metric label="Total vendido" value={sales} /><Metric label="Efectivo" value={payments.cash} /><Metric label="SINPE" value={payments.sinpe} /><Metric label="Otros métodos" value={payments.other} /><Metric label="Gastos" value={expensesInPeriod} />{type !== 'shift' && <Metric label="Costos" value={type === 'cylinder' ? cylinderCost : allCost} />}<Metric label="Monto esperado" value={expected} /><Metric label="Diferencia" value={difference} /></SimpleGrid>
            {type === 'cylinder' ? <CylinderTable lines={cylinders} /> : <OrderTable orders={included} />}
            {type === 'shift' && <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mt="5">
              <FormControl isRequired><HelpLabel help="Cantidad que realmente contaste en caja. Se compara con el monto esperado." required>Monto declarado</HelpLabel><Input type="number" value={declared} onChange={(e) => setDeclared(e.target.value)} /></FormControl>
              <FormControl isRequired={difference !== 0}><HelpLabel help="Si falta o sobra dinero, explicá la razón para que quede registrada." required={difference !== 0}>Nota explicativa</HelpLabel><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></FormControl>
            </SimpleGrid>}
            <Alert status="info" mt="4"><AlertIcon />{type === 'cylinder' ? `Al confirmar, ${included.length} pedidos quedarán marcados para que sus cilindros no vuelvan a contarse.` : `Al confirmar, ${included.length} pedidos quedarán liquidados y no podrán incluirse en otro cierre de turno.`}</Alert>
            <Button colorScheme="brand" mt="4" onClick={confirm} isLoading={saving} isDisabled={(type === 'shift' && (!fromTime || !toTime)) || !included.length || (isAdmin && !responsibleId)}>Confirmar corte</Button>
          </Box>
        </TabPanel>
        <TabPanel px="0"><Balance embedded /></TabPanel>
        <TabPanel px="0"><HistoryTable history={history} /></TabPanel>
      </TabPanels>
    </Tabs>
  </Box>;
}

function ResponsibleControl({ isAdmin, collaborators, responsibleId, responsibleName, onChange }: { isAdmin: boolean; collaborators: UserItem[]; responsibleId: string; responsibleName: string; onChange: (id: string) => void }) {
  return isAdmin ? <FormControl isRequired><FormLabel>Colaborador responsable</FormLabel><Select placeholder="Seleccioná un colaborador" value={responsibleId} onChange={event => onChange(event.target.value)}>{collaborators.map(item => <option key={item.userId} value={item.userId}>{item.name || item.email}</option>)}</Select></FormControl> : <FormControl><FormLabel>Colaborador responsable</FormLabel><Input value={responsibleName} isReadOnly /></FormControl>;
}

function OrderTable({ orders }: { orders: OrderItem[] }) { return <Box overflowX="auto" mt="5"><Table size="sm"><Thead><Tr><Th>Pedido</Th><Th>Fecha</Th><Th>Cliente</Th><Th isNumeric>Total</Th></Tr></Thead><Tbody>{orders.map((o) => <Tr key={o.id}><Td>{o.orderCode}</Td><Td>{new Date(o.paidAt || o.requestDate).toLocaleString('es-CR')}</Td><Td>{o.client}</Td><Td isNumeric>{crc(orderTotal(o))}</Td></Tr>)}</Tbody></Table>{!orders.length && <Text p="4" color="gray.500">No hay pedidos pagados y sin cortar en este periodo.</Text>}</Box>; }
function ExpenseTable({ expenses }: { expenses: ExpenseItem[] }) { return <Box bg="white" p="5" borderRadius="xl" overflowX="auto"><Heading size="md" mb="3">Gastos registrados</Heading><Table size="sm"><Thead><Tr><Th>Fecha</Th><Th>Descripción</Th><Th>Categoría</Th><Th>Colaborador</Th><Th isNumeric>Monto</Th></Tr></Thead><Tbody>{[...expenses].sort((a,b) => b.occurredAt.localeCompare(a.occurredAt)).map((e) => <Tr key={e.id}><Td>{new Date(e.occurredAt).toLocaleString('es-CR')}</Td><Td>{e.description}</Td><Td>{e.category}</Td><Td>{e.createdByName || 'Sin nombre registrado'}</Td><Td isNumeric>{crc(e.amount)}</Td></Tr>)}</Tbody></Table></Box>; }
function CylinderTable({ lines }: { lines: ClosingItem['cylinderLines'] }) { return <Box overflowX="auto" mt="5"><Table size="sm"><Thead><Tr><Th>Tipo</Th><Th>Tamaño</Th><Th isNumeric>Cantidad</Th><Th isNumeric>Costo unitario</Th><Th isNumeric>Costo total</Th></Tr></Thead><Tbody>{lines?.map((l) => <Tr key={l.productId}><Td>{l.type}</Td><Td>{l.size}</Td><Td isNumeric>{l.quantity}</Td><Td isNumeric>{crc(l.unitCost)}</Td><Td isNumeric>{crc(l.totalCost)}</Td></Tr>)}</Tbody></Table></Box>; }
function HistoryTable({ history }: { history: ClosingItem[] }) { return <Box bg="white" p="5" borderRadius="xl" overflowX="auto"><Table size="sm"><Thead><Tr><Th>Fecha</Th><Th>Tipo</Th><Th>Colaborador</Th><Th>Pedidos</Th><Th isNumeric>Esperado</Th><Th isNumeric>Declarado</Th><Th isNumeric>Diferencia</Th><Th>Nota</Th><Th>Estado</Th></Tr></Thead><Tbody>{history.map((c) => <Tr key={c.id}><Td>{new Date(c.createdAt).toLocaleString('es-CR')}</Td><Td>{TYPE_LABEL[c.type]}</Td><Td>{c.createdByName || 'Sin nombre registrado'}</Td><Td>{c.orderIds.length}</Td><Td isNumeric>{crc(c.expectedAmount)}</Td><Td isNumeric>{crc(c.declaredAmount)}</Td><Td isNumeric>{crc(c.difference)}</Td><Td>{c.differenceNote || '—'}</Td><Td><Badge colorScheme="green">Confirmado</Badge></Td></Tr>)}</Tbody></Table>{!history.length && <Text p="4">Aún no hay cortes confirmados.</Text>}</Box>; }
