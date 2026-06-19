// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Button, FormControl, FormLabel, Input, Select, SimpleGrid, Stack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import { getCustomerDraft, saveCustomerDraft } from './customerDraft';

const locationOptions = {
  'San José': {
    Acosta: {
      'San Ignacio': ['Centro', 'Turrujal', 'Chirraca'],
      Guaitil: ['Guaitil centro', 'La Cruz'],
      Palmichal: ['Palmichal centro', 'Bajo Arias'],
      Cangrejal: ['Cangrejal centro', 'Sabanillas'],
      Sabanillas: ['Sabanillas centro', 'Bajos de Jorco'],
    },
    Aserrí: {
      Aserrí: ['Centro', 'Poás', 'Salitrillos'],
      Tarbaca: ['Tarbaca centro', 'Vuelta de Jorco'],
      'Vuelta de Jorco': ['Vuelta de Jorco centro', 'Legua'],
      Monterrey: ['Monterrey centro', 'La Uruca'],
    },
    Desamparados: {
      Frailes: ['Frailes centro', 'Bustamante'],
      'San Cristóbal': ['San Cristóbal Norte', 'San Cristóbal Sur'],
      Rosario: ['Rosario centro', 'La Fila'],
    },
    Mora: {
      Colón: ['Ciudad Colón centro', 'Brasil'],
      Guayabo: ['Guayabo centro', 'Tabarcia'],
      Picagres: ['Picagres centro', 'Jaris'],
    },
    Puriscal: {
      Santiago: ['Santiago centro', 'Mercedes Sur'],
      Barbacoas: ['Barbacoas centro', 'Grifo Alto'],
      Candelarita: ['Candelarita centro', 'Desamparaditos'],
    },
    Tarrazú: {
      'San Marcos': ['San Marcos centro', 'Bajo San Juan'],
      'San Lorenzo': ['San Lorenzo centro', 'Santa Marta'],
      'San Carlos': ['San Carlos centro', 'Bajo Canet'],
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

  const cantons = useMemo(() => Object.keys(locationOptions[form.province] || {}), [form.province]);
  const districts = useMemo(() => Object.keys(locationOptions[form.province]?.[form.canton] || {}), [form.province, form.canton]);
  const neighborhoods = locationOptions[form.province]?.[form.canton]?.[form.district] || [];
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
    <PublicPage title="Información del cliente" description="Complete la información del cliente y su dirección. De momento se limita a Acosta y cantones vecinos." maxW="1000px">
      <PublicCard>
        <Stack spacing="16px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Apodo</FormLabel><Input value={form.nickname} onChange={(e) => set('nickname', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Provincia</FormLabel><Select value={form.province} onChange={(e) => set('province', e.target.value)}><option>San José</option></Select></FormControl>
            <FormControl isRequired><FormLabel>Cantón</FormLabel><Select value={form.canton} onChange={(e) => { const nextCanton = e.target.value; const nextDistrict = Object.keys(locationOptions[form.province]?.[nextCanton] || {})[0] || ''; setForm((prev) => ({ ...prev, canton: nextCanton, district: nextDistrict, neighborhood: (locationOptions[form.province]?.[nextCanton]?.[nextDistrict] || [''])[0] })); }}>{cantons.map((canton) => <option key={canton}>{canton}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Distrito</FormLabel><Select value={form.district} onChange={(e) => { const nextDistrict = e.target.value; setForm((prev) => ({ ...prev, district: nextDistrict, neighborhood: (locationOptions[form.province]?.[form.canton]?.[nextDistrict] || [''])[0] })); }}>{districts.map((district) => <option key={district}>{district}</option>)}</Select></FormControl>
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
