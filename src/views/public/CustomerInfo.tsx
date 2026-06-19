// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Button, FormControl, FormLabel, Input, Select, SimpleGrid, Stack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import { getCustomerDraft, saveCustomerDraft } from './customerDraft';

const locationOptions = {
  SanJosé: {
    Acosta: {
      SanIgnacio: ['Centro', 'Turrujal', 'Chirraca'],
      Guaitil: ['Guaitil centro', 'La Cruz'],
      Palmichal: ['Palmichal centro', 'Bajo Arias'],
      Cangrejal: ['Cangrejal centro', 'Sabanillas'],
      Sabanillas: ['Sabanillas centro', 'Bajos de Jorco'],
    },
  },
};

export default function CustomerInfo() {
  const history = useHistory();
  const draft = getCustomerDraft();
  const [form, setForm] = useState({
    name: draft.name || '',
    nickname: draft.nickname || '',
    province: draft.address?.province || 'San José',
    canton: draft.address?.canton || 'Acosta',
    district: draft.address?.district || 'San Ignacio',
    neighborhood: draft.address?.neighborhood || 'Centro',
    details: draft.address?.details || '',
    coordinates: draft.address?.coordinates || '',
    locationUrl: draft.address?.locationUrl || '',
  });

  const districts = useMemo(() => Object.keys(locationOptions.SanJosé.Acosta), []);
  const neighborhoods = locationOptions.SanJosé.Acosta[form.district] || [];
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveAndContinue = () => {
    saveCustomerDraft({
      name: form.name,
      nickname: form.nickname,
      address: {
        province: form.province,
        canton: form.canton,
        district: form.district,
        neighborhood: form.neighborhood,
        details: form.details,
        coordinates: form.coordinates,
        locationUrl: form.locationUrl,
      },
    });
    history.push('/customer/products');
  };

  return (
    <PublicPage title="Información del cliente" description="Complete la información del cliente y su dirección. De momento se limita a Acosta y alrededores." maxW="1000px">
      <PublicCard>
        <Stack spacing="16px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Apodo</FormLabel><Input value={form.nickname} onChange={(e) => set('nickname', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Provincia</FormLabel><Select value={form.province} onChange={(e) => set('province', e.target.value)}><option>San José</option></Select></FormControl>
            <FormControl isRequired><FormLabel>Cantón</FormLabel><Select value={form.canton} onChange={(e) => set('canton', e.target.value)}><option>Acosta</option></Select></FormControl>
            <FormControl isRequired><FormLabel>Distrito</FormLabel><Select value={form.district} onChange={(e) => { set('district', e.target.value); set('neighborhood', locationOptions.SanJosé.Acosta[e.target.value][0]); }}>{districts.map((district) => <option key={district}>{district}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Barrio</FormLabel><Select value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)}>{neighborhoods.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}</Select></FormControl>
            <FormControl><FormLabel>Coordenadas</FormLabel><Input value={form.coordinates} onChange={(e) => set('coordinates', e.target.value)} placeholder="Ej. 9.8000,-84.1600" /></FormControl>
            <FormControl><FormLabel>Link de ubicación (plan B)</FormLabel><Input value={form.locationUrl} onChange={(e) => set('locationUrl', e.target.value)} placeholder="Google Maps / Waze" /></FormControl>
          </SimpleGrid>
          <FormControl isRequired><FormLabel>Otras señas</FormLabel><Input value={form.details} onChange={(e) => set('details', e.target.value)} /></FormControl>
          <Button colorScheme="brand" onClick={saveAndContinue}>Continuar al pedido</Button>
        </Stack>
      </PublicCard>
      <SponsorStrip type="Premium" max={8} title="Patrocinadores Premium" />
    </PublicPage>
  );
}
