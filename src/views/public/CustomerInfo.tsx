import React, { useEffect, useMemo, useState } from 'react';
import { Alert, AlertIcon, Box, Button, FormControl, FormLabel, Input, Select, SimpleGrid, Stack, Text } from '@chakra-ui/react';
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
  // sessionStorage is user-controlled and can contain drafts written by older
  // deployments. Treat the canonical address as untrusted at runtime.
  const saved = draft.address?.canonical;
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [provinces, setProvinces] = useState<TerritoryOption[]>([]);
  const [cantons, setCantons] = useState<TerritoryOption[]>([]);
  const [districts, setDistricts] = useState<TerritoryOption[]>([]);
  const [showGps, setShowGps] = useState(false);
  const [form, setForm] = useState({
    name: draft.name || '', nickname: draft.nickname || '',
    province: saved?.province?.name || draft.address?.province || 'San José',
    canton: saved?.canton?.name || draft.address?.canton || 'Acosta',
    district: saved?.district?.name || draft.address?.district || 'San Ignacio',
    locality: saved?.locality?.name || draft.address?.neighborhood || 'Centro',
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
  const localities = catalogLocalities;
  useEffect(() => {
    if (localities.length && !localities.includes(form.locality)) {
      setForm(prev => ({ ...prev, locality: localities[0] }));
    }
  }, [localities, form.locality]);
  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const saveAndContinue = async () => {
    if (isSaving) return;
    setMessage('');
    if (!draft.nationalId || !draft.phone) return setMessage('Primero verificá tu cédula y teléfono.');
    if (!form.name.trim() || !form.province || !form.canton || !form.district || !form.locality.trim() || !form.details.trim()) {
      return setMessage('Completá el nombre, la división territorial, el pueblo y las señas de entrega.');
    }
    if (!localities.includes(form.locality)) return setMessage('Seleccioná un pueblo o localidad de la lista.');
    if (form.name.trim().length > 120 || form.nickname.trim().length > 60 || form.locality.trim().length > 100 || form.details.trim().length > 300 || form.additionalDirections.trim().length > 300) {
      return setMessage('Revisá la longitud del nombre, localidad y señas de entrega.');
    }
    const province = byName(provinces, form.province);
    const canton = byName(cantons, form.canton);
    const district = byName(districts, form.district);
    if (!province || !canton || !district) return setMessage('Seleccioná una provincia, cantón y distrito válidos.');

    const canonical: AddressItem = {
      province, canton, district,
      locality: { name: form.locality.trim(), source: 'territorial-catalog' },
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
    <PublicPage title="Información del cliente" description="Seleccioná la dirección de entrega y, si querés, agregá el punto GPS exacto para el repartidor." maxW="1000px">
      <Box h={{ base: '20px', md: '28px' }} />
      <PublicCard><Stack spacing="18px">
        {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
          <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input value={form.name} onChange={e => set('name', e.target.value)} /></FormControl>
          <FormControl><FormLabel>Apodo</FormLabel><Input value={form.nickname} onChange={e => set('nickname', e.target.value)} /></FormControl>
        </SimpleGrid>
        <Box>
          <Text fontWeight="900" mb="1">Dirección de entrega</Text>
          <Text fontSize="sm" color="gray.600" mb="4">Seleccioná cada nivel para evitar errores al ubicar el pedido.</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl isRequired><FormLabel>Provincia</FormLabel><Select isDisabled={catalogLoading} value={form.province} onChange={e => setForm(prev => ({ ...prev, province: e.target.value, canton: '', district: '', locality: '', captureSource: 'manual' }))}>{provinces.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Cantón</FormLabel><Select value={form.canton} onChange={e => setForm(prev => ({ ...prev, canton: e.target.value, district: '', locality: '', captureSource: 'manual' }))}>{cantons.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Distrito</FormLabel><Select value={form.district} onChange={e => setForm(prev => ({ ...prev, district: e.target.value, locality: '', captureSource: 'manual' }))}>{districts.map(item => <option key={item.code} value={item.name}>{item.name}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Pueblo o localidad</FormLabel><Select placeholder="Seleccioná el pueblo o localidad" value={form.locality} onChange={e => set('locality', e.target.value)}>{localities.map(name => <option key={name} value={name}>{name}</option>)}</Select></FormControl>
          </SimpleGrid>
        </Box>
        <FormControl isRequired><FormLabel>Dirección exacta / señas</FormLabel><Input value={form.details} onChange={e => set('details', e.target.value)} placeholder="Casa, color, referencia o punto cercano" /></FormControl>
        <FormControl><FormLabel>Indicaciones adicionales</FormLabel><Input value={form.additionalDirections} onChange={e => set('additionalDirections', e.target.value)} placeholder="Portón, horario, a quién llamar u otra indicación" /></FormControl>
        <Box p="16px" borderWidth="1px" borderRadius="18px" bg="gray.50">
          <Text fontWeight="800">Ubicación exacta por GPS</Text>
          <Text fontSize="sm" color="gray.600" mb="3">Es opcional. Sirve para que el repartidor encuentre el punto exacto; no reemplaza la dirección seleccionada arriba.</Text>
          <Button variant="outline" colorScheme="brand" onClick={() => setShowGps(value => !value)}>{showGps ? 'Ocultar ubicación GPS' : 'Agregar mi ubicación actual'}</Button>
          {showGps && <Box mt="4"><DeviceLocationMap coordinates={form.coordinates} onLocation={location => {
            const detected = location.detectedAddress;
            setForm(prev => ({ ...prev, coordinates: location.coordinates, locationUrl: location.locationUrl, latitude: location.latitude, longitude: location.longitude, accuracyMeters: location.accuracyMeters, captureSource: 'gps', ...(detected ? { geocoding: { provider: detected.provider, ...(detected.providerPlaceId ? { providerPlaceId: detected.providerPlaceId } : {}), ...(detected.confidence != null ? { confidence: detected.confidence } : {}), ...(detected.precision ? { precision: detected.precision } : {}), resolvedAt: new Date().toISOString() } } : {}) }));
          }} /></Box>}
        </Box>
        <OrderNavigation currentStep={2} backLabel="Volver a verificación" continueLabel={isSaving ? 'Guardando…' : 'Continuar al pedido'} onBack={() => history.replace('/customer/data')} onContinue={saveAndContinue} isContinueLoading={isSaving} />
      </Stack></PublicCard>
      <MallPreview compact />
    </PublicPage>
  );
}
