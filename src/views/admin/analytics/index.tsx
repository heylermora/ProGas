import { Badge, Box, Button, Flex, Input, Select, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from 'components/card/Card';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import FormField from 'components/form/FormField';
import PageHeader from 'components/layout/PageHeader';
import AnalyticsService from 'services/AnalyticsService';
import SponsorService from 'services/SponsorService';
import { AnalyticsReport } from 'interfaces/AnalyticsEvent';
import SponsorItem from 'interfaces/SponsorItem';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Costa_Rica', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const initialFrom = () => new Date(new Date(`${today()}T00:00:00-06:00`).getTime() - 29 * 86400000).toISOString().slice(0, 10);

export default function AnalyticsAdmin() {
  const [from, setFrom] = useState(initialFrom);
  const [until, setUntil] = useState(today);
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState<SponsorItem[]>([]);
  const [report, setReport] = useState<AnalyticsReport>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError('');
    try {
      const end = new Date(new Date(`${until}T00:00:00-06:00`).getTime() + 86400000);
      const [data, sponsors] = await Promise.all([AnalyticsService.getReport(new Date(`${from}T00:00:00-06:00`), end), SponsorService.getAll()]);
      if (current === request.current) { setReport(data); setBusinesses(sponsors); }
    } catch {
      if (current === request.current) setError('No pudimos cargar las métricas. Revisá el período (máximo 92 días) y que las reglas de Firestore estén desplegadas.');
    } finally { if (current === request.current) setLoading(false); }
  }, [from, until]);
  useEffect(() => { void load(); return () => { request.current += 1; }; }, [load]);
  const names = useMemo(() => new Map(businesses.map(business => [business.id, business.name])), [businesses]);
  const rows = report?.links.filter(link => !businessId || link.businessId === businessId) || [];
  const totals = new Map<string, number>();
  report?.links.forEach(link => totals.set(link.businessId, (totals.get(link.businessId) || 0) + link.clicks));
  return <Box>
    <PageHeader title="Visitas y clics" description="Actividad de la portada y contactos de los negocios. Una vez por sesión y enlace; fechas de Costa Rica." action={<Button onClick={() => { void load(); }}>Actualizar</Button>} />
    <Card mb={5}>
      <Flex gap={4} wrap="wrap">
        <FormField label="Desde"><Input type="date" aria-label="Desde" value={from} onChange={event => setFrom(event.target.value)} /></FormField>
        <FormField label="Hasta"><Input type="date" aria-label="Hasta" value={until} onChange={event => setUntil(event.target.value)} /></FormField>
        <FormField label="Negocio"><Select aria-label="Negocio" value={businessId} onChange={event => setBusinessId(event.target.value)}><option value="">Todos los negocios</option>{Array.from(new Set([...businesses.map(business => business.id), ...totals.keys()])).map(id => <option key={id} value={id}>{names.get(id) || `Negocio no disponible (${id})`}</option>)}</Select></FormField>
      </Flex>
    </Card>
    <AsyncContent isLoading={loading} loadingLabel="Cargando métricas" error={error}>
      {report && <>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={5}>
          {[['Visitas a la portada', report.visits], ['Clics en Ver negocios', report.browseClicks], ['Clics en contactos', report.linkClicks]].map(([label, count]) => <Card key={label}><Text fontSize="sm">{label}</Text><Text fontSize="3xl" fontWeight="800">{count}</Text></Card>)}
        </SimpleGrid>
        <Card mb={5}><Text fontWeight="800" mb={3}>Clics por negocio</Text><Flex gap={3} wrap="wrap">{Array.from(totals).filter(([id]) => !businessId || businessId === id).sort((a, b) => b[1] - a[1]).map(([id, count]) => <Badge key={id} px={3} py={2} colorScheme="purple">{names.get(id) || id}: {count}</Badge>)}{totals.size === 0 && <Text>No hay clics de negocios en este período.</Text>}</Flex></Card>
        <Card><Text fontWeight="800" mb={3}>Detalle por negocio y URL</Text><Box overflowX="auto"><Table size="sm" minW="640px"><Thead><Tr><Th>Negocio</Th><Th>Red</Th><Th>URL abierta</Th><Th isNumeric>Clics</Th></Tr></Thead><Tbody>{rows.map(row => <Tr key={JSON.stringify([row.businessId, row.url])}><Td>{names.get(row.businessId) || row.businessId}</Td><Td>{row.network}</Td><Td><Text maxW="480px" wordBreak="break-all">{row.url}</Text></Td><Td isNumeric>{row.clicks}</Td></Tr>)}</Tbody></Table></Box>{rows.length === 0 && <Text py={4}>No hay enlaces registrados para este filtro.</Text>}</Card>
        <Text mt={4} fontSize="sm">Los totales generales corresponden al período completo. El filtro por negocio aplica al resumen y al detalle de contactos. Estas mediciones no equivalen a personas únicas y pueden faltar por bloqueos del navegador o conexión.</Text>
      </>}
    </AsyncContent>
  </Box>;
}
