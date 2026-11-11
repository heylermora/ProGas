import { Badge, Box, Button, Flex, Input, Link, Progress, Select, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from 'components/card/Card';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import FormField from 'components/form/FormField';
import PageHeader from 'components/layout/PageHeader';
import AnalyticsService from 'services/AnalyticsService';
import SponsorService from 'services/SponsorService';
import { AnalyticsReport } from 'interfaces/AnalyticsEvent';
import SponsorItem from 'interfaces/SponsorItem';
import StatCard from 'components/dataDisplay/StatCard';

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
  const rows = (report?.links.filter(link => !businessId || link.businessId === businessId) || []).slice().sort((a, b) => b.clicks - a.clicks);
  const totals = new Map<string, number>();
  report?.links.forEach(link => totals.set(link.businessId, (totals.get(link.businessId) || 0) + link.clicks));
  const ranked = Array.from(totals).filter(([id]) => !businessId || businessId === id).sort((a, b) => b[1] - a[1]);
  const contactClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const channels = new Map<string, number>();
  rows.forEach(row => channels.set(row.network, (channels.get(row.network) || 0) + row.clicks));
  const businessName = (id: string) => names.get(id) || 'Negocio no disponible';
  const compactUrl = (url: string) => {
    try { const parsed = new URL(url); return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname === '/' ? '' : parsed.pathname}`; }
    catch { return 'Ver destino'; }
  };
  return <Box minW={0}>
    <PageHeader title="Visitas y clics" description="Actividad de la portada y contactos de los negocios. Una vez por sesión y enlace; fechas de Costa Rica." action={<Button onClick={() => { void load(); }}>Actualizar</Button>} />
    <Card mb={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <FormField label="Desde"><Input type="date" aria-label="Desde" value={from} onChange={event => setFrom(event.target.value)} /></FormField>
        <FormField label="Hasta"><Input type="date" aria-label="Hasta" value={until} onChange={event => setUntil(event.target.value)} /></FormField>
        <FormField label="Negocio"><Select aria-label="Negocio" value={businessId} onChange={event => setBusinessId(event.target.value)}><option value="">Todos los negocios</option>{Array.from(new Set([...businesses.map(business => business.id), ...totals.keys()])).map(id => <option key={id} value={id}>{names.get(id) || `Negocio no disponible (${id})`}</option>)}</Select></FormField>
      </SimpleGrid>
    </Card>
    <AsyncContent isLoading={loading} loadingLabel="Cargando métricas" error={error}>
      {report && <>
        <Text fontSize="sm" fontWeight="700" mb={3}>Resumen general del período · todos los negocios</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <StatCard label="Visitas a la portada" value={report.visits} />
          <StatCard label="Clics en Ver negocios" value={report.browseClicks} />
          <StatCard label="Clics en contactos" value={report.linkClicks} />
        </SimpleGrid>
        <Flex justify="space-between" align="center" gap={3} mb={4} wrap="wrap">
          <Text as="h2" fontSize="lg" fontWeight="800">{businessId ? businessName(businessId) : 'Rendimiento de los negocios'}</Text>
          <Badge colorScheme="purple" px={3} py={1}>{contactClicks} clics en contactos · {ranked.length} negocios</Badge>
        </Flex>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5} mb={5}>
          <Card><Text as="h3" fontWeight="800" mb={4}>Clics por negocio</Text>
            <Box maxH="320px" overflowY="auto">
              {ranked.map(([id, count], index) => <Box key={id} mb={4}>
                <Flex justify="space-between" gap={3} mb={1} align="baseline">
                  <Button variant="link" size="sm" onClick={() => setBusinessId(id)} textAlign="left" whiteSpace="normal" minW={0}>{index + 1}. {businessName(id)}</Button>
                  <Text fontSize="sm" flexShrink={0} fontWeight="700">{count} · {contactClicks ? Math.round(count / contactClicks * 100) : 0}%</Text>
                </Flex>
                <Progress value={count} max={ranked[0][1]} size="sm" colorScheme="purple" borderRadius="full" aria-label={`Clics de ${businessName(id)}`} />
              </Box>)}
              {!ranked.length && <Text>No hay clics de negocios en este período.</Text>}
            </Box>
            {businessId && <Button mt={3} size="sm" variant="ghost" onClick={() => setBusinessId('')}>Ver todos los negocios</Button>}
          </Card>
          <Card><Text as="h3" fontWeight="800" mb={4}>Canales de contacto</Text>
            {Array.from(channels).sort((a, b) => b[1] - a[1]).map(([network, count]) => <Box key={network} mb={4}>
              <Flex justify="space-between" mb={1}><Text fontSize="sm" textTransform="capitalize">{network === 'website' ? 'Sitio web' : network}</Text><Text fontSize="sm" fontWeight="700">{count} · {contactClicks ? Math.round(count / contactClicks * 100) : 0}%</Text></Flex>
              <Progress value={count} max={contactClicks || 1} size="sm" colorScheme="purple" borderRadius="full" aria-label={`Clics en ${network}`} />
            </Box>)}
            {!channels.size && <Text>No hay contactos registrados para este filtro.</Text>}
          </Card>
        </SimpleGrid>
        <Card><Text as="h3" fontWeight="800" mb={1}>Detalle de contactos</Text><Text fontSize="sm" mb={4}>Ordenado por clics. Despliegue un destino para consultar su URL completa.</Text>
          <Box overflowX="auto"><Table size="sm" minW="540px" sx={{ tableLayout: 'fixed' }}><Thead><Tr><Th w="28%">Negocio</Th><Th w="18%">Canal</Th><Th w="40%">Destino</Th><Th w="14%" isNumeric>Clics</Th></Tr></Thead><Tbody>{rows.map(row => <Tr key={JSON.stringify([row.businessId, row.url])}>
            <Td overflowWrap="anywhere">{businessName(row.businessId)}{!names.get(row.businessId) && <Box as="details" mt={1}><Box as="summary" cursor="pointer" fontSize="xs">Ver identificador</Box><Text fontSize="xs">{row.businessId}</Text></Box>}</Td>
            <Td textTransform="capitalize">{row.network === 'website' ? 'Sitio web' : row.network}</Td>
            <Td><Box as="details"><Box as="summary" cursor="pointer" fontSize="sm" overflowWrap="anywhere">{compactUrl(row.url)}</Box><Text mt={2} fontSize="xs" overflowWrap="anywhere">{row.url}</Text>{/^(https?:\/\/|mailto:)/i.test(row.url) && <Link href={row.url} isExternal fontSize="sm" color="purple.600">Abrir enlace ↗</Link>}</Box></Td>
            <Td isNumeric fontWeight="700">{row.clicks}</Td></Tr>)}</Tbody></Table></Box>{rows.length === 0 && <Text py={4}>No hay enlaces registrados para este filtro.</Text>}</Card>
        <Text mt={4} fontSize="sm">Los totales generales corresponden al período completo. El filtro por negocio aplica al resumen y al detalle de contactos. Estas mediciones no equivalen a personas únicas y pueden faltar por bloqueos del navegador o conexión.</Text>
      </>}
    </AsyncContent>
  </Box>;
}
