import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, FormControl, FormHelperText, FormLabel, Input, Select, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import ClientService from 'services/ClientService';
import DeviceLocationMap from 'components/form/DeviceLocationMap';
import TerritoryService, { normalizeTerritoryName, TerritoryOption } from 'services/TerritoryService';
import { COSTA_RICA_CATALOG_VERSION } from 'data/costaRicaLocations';
import { AddressItem, CustomerAddressItem } from 'interfaces/AddressItem';
import { PublicCard, PublicPage } from './PublicPage';
import MallPreview from './MallPreview';
import OrderNavigation from './OrderNavigation';
import { CustomerDraftAddress, getCustomerDraft, saveCustomerDraft } from './customerDraft';
import { mapsSearchUrl } from 'utils/location';

const byName = (items: TerritoryOption[], name: string) => items.find(item => normalizeTerritoryName(item.name).localeCompare(normalizeTerritoryName(name), 'es', { sensitivity: 'base' }) === 0);

export default function CustomerInfo() {
  const history = useHistory();
  const draft = getCustomerDraft();
  const saved = draft.address?.canonical;
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [provinces, setProvinces] = useState<TerritoryOption[]>([]);
  const [cantons, setCantons] = useState<TerritoryOption[]>([]);
  const [districts, setDistricts] = useState<TerritoryOption[]>([]);
  const [detectedLocalities, setDetectedLocalities] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: draft.name || '', nickname: draft.nickname || '',
    province: saved?.province.name || draft.address?.province || 'San José',
    canton: saved?.canton.name || draft.address?.canton || 'Acosta',
    district: saved?.district.name || draft.address?.district || 'San Ignacio',
    locality: saved?.locality.name || draft.address?.neighborhood || 'Centro',
    details: saved?.exactAddress || draft.address?.details || '',
    additionalDirections: saved?.additionalDirections || '',
    coordinates: draft.address?.coordinates || '', locationUrl: draft.address?.locationUrl || '',
    latitude: saved?.position?.latitude, longitude: saved?.position?.longitude, accuracyMeters: saved?.position?.accuracyMeters,
    captureSource: saved?.captureSource || ('manual' as const),
    geocoding: saved?.geocoding,
  });

  useEffect(() => {
    TerritoryService.getProvinces().then(setProvinces).finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    const province = byName(provinces, form.province);
    if (!province) return;
    TerritoryService.getCantons(province).then(items => {
      setCantons(items);
      if (items.length && !byName(items, form.canton)) setForm(prev => ({ ...prev, canton: items[0].name, district: '', locality: '' }));
    });
  }, [provinces, form.province, form.canton]);

  useEffect(() => {
    const province = byName(provinces, form.province);
    const canton = byName(cantons, form.canton);
    if (!province || !canton) return;
    TerritoryService.getDistricts(province, canton).then(items => {
      setDistricts(items);
      if (items.length && !byName(items, form.district)) setForm(prev => ({ ...prev, district: items[0].name, locality: '' }));
    });
  }, [provinces, cantons, form.province, form.canton, form.district]);

  const catalogLocalities = useMemo(() => TerritoryService.getLocalities(form.province, form.canton, form.district), [form.province, form.canton, form.district]);
  const localities = Array.from(new Set([...detectedLocalities, ...catalogLocalities])).filter(Boolean);
  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const saveAndContinue = async () => {
    if (isSaving) return;
    setMessage('');
    if (!draft.nationalId || !draft.phone) return setMessage('Primero verificá tu cédula y teléfono.');
    if (!form.name.trim() || !form.province || !form.canton || !form.district || !form.locality.trim() || !form.details.trim()) {
      return setMessage('Completá el nombre, la división territorial, el pueblo y las señas de entrega.');
    }
    if (form.name.trim().length > 120 || form.nickname.trim().length > 60 || form.locality.trim().length > 100 || form.details.trim().length > 300 || form.additionalDirections.trim().length > 300) {
      return setMessage('Revisá la longitud del nombre, localidad y señas de entrega.');
    }
    const province = byName(provinces, form.province);
    const canton = byName(cantons, form.canton);
    const district = byName(districts, form.district);
    if (!province || !canton || !district) return setMessage('Seleccioná una provincia, cantón y distrito válidos.');

    const canonical: AddressItem = {
      province, canton, district,
      locality: { name: form.locality.trim(), source: detectedLocalities.includes(form.locality) ? 'reverse-geocoding' : 'user' },
      exactAddress: form.details.trim(),
      ...(form.additionalDirections.trim() ? { additionalDirections: form.additionalDirections.trim() } : {}),
      ...(Number.isFinite(form.latitude) && Number.isFinite(form.longitude) ? { position: { latitude: Number(form.latitude), longitude: Number(form.longitude), ...(form.accuracyMeters ? { accuracyMeters: form.accuracyMeters } : {}) } } : {}),
      captureSource: form.captureSource,
      ...(form.geocoding ? { geocoding: form.geocoding } : {}),
      catalogVersion: COSTA_RICA_CATALOG_VERSION,
    };
    const addressQuery = [form.province, form.canton, form.district, form.locality, form.details].filter(Boolean).join(', ');
    const address: CustomerDraftAddress = { province: form.province, canton: form.canton, district: form.district, neighborhood: form.locality.trim(), details: form.details.trim(), additionalDirections: form.additionalDirections.trim(), coordinates: form.coordinates, locationUrl: form.locationUrl || mapsSearchUrl(form.coordinates || addressQuery), canonical };

    try {
      setIsSaving(true);
      let clientRecordId = draft.clientRecordId;
      if (!draft.isExistingClient) {
        const now = new Date().toISOString();
        const customerAddress: CustomerAddressItem = { ...canonical, id: crypto.randomUUID(), label: 'Casa', isDefault: true, active: true, createdAt: now, updatedAt: now };
        const created = await ClientService.createPublic({ nationalId: draft.nationalId, phone: draft.phone, name: form.name.trim(), nickname: form.nickname.trim(), active: true, address, addresses: [customerAddress], defaultAddressId: customerAddress.id });
        clientRecordId = created.id;
        address.savedAddressId = customerAddress.id;
      }
      saveCustomerDraft({ clientRecordId, isExistingClient: true, name: form.name.trim(), nickname: form.nickname.trim(), address });
      history.push('/customer/products');
    } catch { setMessage('No pudimos guardar la información. Verificá los datos e intentá nuevamente.'); }
    finally { setIsSaving(false); }
  };

  return (
    <PublicPage title="Información del cliente" description="Elegí la dirección manualmente o usá tu ubicación para recibir una sugerencia que siempre podés corregir." maxW="1000px">
      <Box h={{ base: '20px', md: '28px' }} />
      <PublicCard><Stack spacing="18px">
        {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
          <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input value={form.name} onChange={e => set('name', e.target.value)} /></FormControl>
          <FormControl><FormLabel>Apodo</FormLabel><Input value={form.nickname} onChange={e => set('nickname', e.target.value)} /></FormControl>
        </SimpleGrid>
        <Box p="16px" borderWidth="1px" borderRadius="18px" bg="gray.50">
          <Text fontWeight="900" mb="2">1. Ubicación GPS (opcional)</Text>
          <Text fontSize="sm" color="gray.600" mb="3">Podemos sugerir la división territorial y el pueblo. Nada se confirma sin que lo revisés.</Text>
          <DeviceLocationMap coordinates={form.coordinates} addressQuery={[form.province, form.canton, form.district, form.locality, form.details].filter(Boolean).join(', ')} onLocation={location => {
            const detected = location.detectedAddress;
            setDetectedLocalities(prev => Array.from(new Set([detected?.neighborhood || '', ...prev])).filter(Boolean));
            setForm(prev => ({ ...prev, coordinates: location.coordinates, locationUrl: location.locationUrl, latitude: location.latitude, longitude: location.longitude, accuracyMeters: location.accuracyMeters, captureSource: 'gps', ...(detected?.province && byName(provinces, detected.province) ? { province: byName(provinces, detected.province)!.name } : {}), ...(detected?.county ? { canton: detected.county } : {}), ...(detected?.district ? { district: detected.district } : {}), ...(detected?.neighborhood ? { locality: detected.neighborhood } : {}), ...(detected ? { geocoding: { provider: detected.provider, ...(detected.providerPlaceId ? { providerPlaceId: detected.providerPlaceId } : {}), ...(detected.confidence != null ? { confidence: detected.confidence } : {}), ...(detected.precision ? { precision: detected.precision } : {}), resolvedAt: new Date().toISOString() } } : {}) }));
          }} />
        </Box>
        <Box>
          <Text fontWeight="900" mb="1">2. Confirmá la dirección</Text>
          <Text fontSize="sm" color="gray.600" mb="4">Los campos son editables aunque hayas usado GPS.</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl isRequired><FormLabel>Provincia</FormLabel><Select isDisabled={catalogLoading} value={form.province} onChange={e => setForm(prev => ({ ...prev, province: e.target.value, canton: '', district: '', locality: '', captureSource: 'manual' }))}>{provinces.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Cantón</FormLabel><Select value={form.canton} onChange={e => setForm(prev => ({ ...prev, canton: e.target.value, district: '', locality: '', captureSource: 'manual' }))}>{cantons.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Distrito</FormLabel><Select value={form.district} onChange={e => setForm(prev => ({ ...prev, district: e.target.value, locality: '', captureSource: 'manual' }))}>{districts.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Pueblo o localidad</FormLabel><Input list="locality-options" value={form.locality} onChange={e => set('locality', e.target.value)} placeholder="Elegí una sugerencia o escribí otra" /><datalist id="locality-options">{localities.map(name => <option key={name} value={name} />)}</datalist><FormHelperText>Podés corregirlo manualmente si la sugerencia no coincide.</FormHelperText></FormControl>
          </SimpleGrid>
        </Box>
        <FormControl isRequired><FormLabel>Dirección exacta / señas</FormLabel><Input value={form.details} onChange={e => set('details', e.target.value)} placeholder="Casa, color, referencia o punto cercano" /></FormControl>
        <FormControl><FormLabel>Indicaciones adicionales</FormLabel><Input value={form.additionalDirections} onChange={e => set('additionalDirections', e.target.value)} placeholder="Portón, horario, a quién llamar u otra indicación" /></FormControl>
        <OrderNavigation currentStep={2} backLabel="Volver a verificación" continueLabel={isSaving ? 'Guardando…' : 'Continuar al pedido'} onBack={() => history.replace('/customer/data')} onContinue={saveAndContinue} isContinueLoading={isSaving} />
      </Stack></PublicCard>
      <MallPreview compact />
    </PublicPage>
  );
}
