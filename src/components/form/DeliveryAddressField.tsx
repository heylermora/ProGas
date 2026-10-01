import { useEffect, useMemo, useRef, useState } from 'react';
import { FormControl, FormLabel, Input, Select, SimpleGrid, Stack, Textarea } from '@chakra-ui/react';
import { AddressItem } from 'interfaces/AddressItem';
import { COSTA_RICA_CATALOG_VERSION } from 'data/costaRicaLocations';
import TerritoryService, { normalizeTerritoryName, TerritoryOption } from 'services/TerritoryService';
import { mapsSearchUrl } from 'utils/location';
import DeviceLocationMap from './DeviceLocationMap';

export type DeliveryLocationValue = {
  address: string;
  lat?: number;
  lng?: number;
  coordinates?: string;
  locationUrl?: string;
  canonical?: AddressItem;
};

const byName = (items: TerritoryOption[], name = '') => items.find(item => normalizeTerritoryName(item.name).localeCompare(normalizeTerritoryName(name), 'es', { sensitivity: 'base' }) === 0);

export default function DeliveryAddressField({ value, onChange }: { value?: DeliveryLocationValue; onChange: (value: DeliveryLocationValue) => void }) {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  const canonical = value?.canonical;
  const [provinces, setProvinces] = useState<TerritoryOption[]>([]);
  const [cantons, setCantons] = useState<TerritoryOption[]>([]);
  const [districts, setDistricts] = useState<TerritoryOption[]>([]);
  const [form, setForm] = useState({
    province: canonical?.province?.name || 'San José', canton: canonical?.canton?.name || 'Acosta', district: canonical?.district?.name || 'San Ignacio',
    locality: canonical?.locality?.name || '', exactAddress: canonical?.exactAddress || value?.address || '', additionalDirections: canonical?.additionalDirections || '',
    coordinates: value?.coordinates || '', locationUrl: value?.locationUrl || '', lat: value?.lat, lng: value?.lng, accuracyMeters: canonical?.position?.accuracyMeters,
    captureSource: canonical?.captureSource || ('manual' as const), geocoding: canonical?.geocoding,
  });
  useEffect(() => { TerritoryService.getProvinces().then(setProvinces); }, []);
  useEffect(() => {
    const province = byName(provinces, form.province); if (!province) return;
    TerritoryService.getCantons(province).then(items => { setCantons(items); if (items.length && !byName(items, form.canton)) setForm(prev => ({ ...prev, canton: items[0].name, district: '' })); });
  }, [provinces, form.province, form.canton]);
  useEffect(() => {
    const province = byName(provinces, form.province); const canton = byName(cantons, form.canton); if (!province || !canton) return;
    TerritoryService.getDistricts(province, canton).then(items => { setDistricts(items); if (items.length && !byName(items, form.district)) setForm(prev => ({ ...prev, district: items[0].name })); });
  }, [provinces, cantons, form.province, form.canton, form.district]);
  const localities = useMemo(() => TerritoryService.getLocalities(form.province, form.canton, form.district), [form.province, form.canton, form.district]);
  useEffect(() => {
    if (localities.length && !localities.includes(form.locality)) setForm(prev => ({ ...prev, locality: localities[0] }));
  }, [localities, form.locality]);

  useEffect(() => {
    const province = byName(provinces, form.province); const canton = byName(cantons, form.canton); const district = byName(districts, form.district);
    if (!province || !canton || !district || !form.locality.trim() || !form.exactAddress.trim()) return;
    const nextCanonical: AddressItem = {
      province, canton, district, locality: { name: form.locality.trim(), source: 'user' }, exactAddress: form.exactAddress.trim(),
      ...(form.additionalDirections.trim() ? { additionalDirections: form.additionalDirections.trim() } : {}),
      ...(Number.isFinite(form.lat) && Number.isFinite(form.lng) ? { position: { latitude: Number(form.lat), longitude: Number(form.lng), ...(form.accuracyMeters ? { accuracyMeters: form.accuracyMeters } : {}) } } : {}),
      captureSource: form.captureSource, ...(form.geocoding ? { geocoding: form.geocoding } : {}), catalogVersion: COSTA_RICA_CATALOG_VERSION,
    };
    const address = [form.province, form.canton, form.district, form.locality, form.exactAddress, form.additionalDirections].filter(Boolean).join(', ');
    onChangeRef.current({ address, coordinates: form.coordinates, locationUrl: form.locationUrl || mapsSearchUrl(form.coordinates || address), ...(Number.isFinite(form.lat) && Number.isFinite(form.lng) ? { lat: form.lat, lng: form.lng } : {}), canonical: nextCanonical });
  }, [provinces, cantons, districts, form]);

  return <Stack spacing="12px">
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px">
      <FormControl isRequired><FormLabel>Provincia</FormLabel><Select value={form.province} onChange={e => setForm(prev => ({ ...prev, province: e.target.value, canton: '', district: '', captureSource: 'manual' }))}>{provinces.map(item => <option key={item.code}>{item.name}</option>)}</Select></FormControl>
      <FormControl isRequired><FormLabel>Cantón</FormLabel><Select value={form.canton} onChange={e => setForm(prev => ({ ...prev, canton: e.target.value, district: '', captureSource: 'manual' }))}>{cantons.map(item => <option key={item.code}>{item.name}</option>)}</Select></FormControl>
      <FormControl isRequired><FormLabel>Distrito</FormLabel><Select value={form.district} onChange={e => setForm(prev => ({ ...prev, district: e.target.value, captureSource: 'manual' }))}>{districts.map(item => <option key={item.code}>{item.name}</option>)}</Select></FormControl>
      <FormControl isRequired><FormLabel>Pueblo / localidad</FormLabel><Select placeholder="Seleccioná el pueblo o localidad" value={form.locality} onChange={e => setForm(prev => ({ ...prev, locality: e.target.value, captureSource: 'manual' }))}>{localities.map(name => <option key={name} value={name}>{name}</option>)}</Select></FormControl>
    </SimpleGrid>
    <FormControl isRequired><FormLabel>Dirección exacta / señas</FormLabel><Textarea value={form.exactAddress} onChange={e => setForm(prev => ({ ...prev, exactAddress: e.target.value, captureSource: 'manual' }))} /></FormControl>
    <FormControl><FormLabel>Indicaciones adicionales</FormLabel><Input value={form.additionalDirections} onChange={e => setForm(prev => ({ ...prev, additionalDirections: e.target.value }))} /></FormControl>
    <DeviceLocationMap coordinates={form.coordinates} onLocation={location => setForm(prev => ({ ...prev, coordinates: location.coordinates, locationUrl: location.locationUrl, lat: location.latitude, lng: location.longitude, accuracyMeters: location.accuracyMeters, captureSource: 'gps', ...(location.detectedAddress ? { geocoding: { provider: location.detectedAddress.provider, ...(location.detectedAddress.providerPlaceId ? { providerPlaceId: location.detectedAddress.providerPlaceId } : {}), ...(location.detectedAddress.confidence != null ? { confidence: location.detectedAddress.confidence } : {}), ...(location.detectedAddress.precision ? { precision: location.detectedAddress.precision } : {}), resolvedAt: new Date().toISOString() } } : {}) }))} />
  </Stack>;
}
