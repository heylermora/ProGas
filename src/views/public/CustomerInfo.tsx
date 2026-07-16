// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, FormLabel, Input, Select, SimpleGrid, Stack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import ClientService from 'services/ClientService';
import DeviceLocationMap from 'components/form/DeviceLocationMap';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import OrderNavigation from './OrderNavigation';
import { getCustomerDraft, saveCustomerDraft } from './customerDraft';
import { mapsSearchUrl } from 'utils/location';

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

  useEffect(() => {
    const nextCanton = cantons.includes(form.canton) ? form.canton : cantons[0] || '';
    const nextDistricts = Object.keys(locationOptions[form.province]?.[nextCanton] || {});
    const nextDistrict = nextDistricts.includes(form.district) ? form.district : nextDistricts[0] || '';
    const nextNeighborhoods = locationOptions[form.province]?.[nextCanton]?.[nextDistrict] || [];
    const nextNeighborhood = nextNeighborhoods.includes(form.neighborhood) ? form.neighborhood : nextNeighborhoods[0] || '';

    if (nextCanton !== form.canton || nextDistrict !== form.district || nextNeighborhood !== form.neighborhood) {
      setForm((prev) => ({ ...prev, canton: nextCanton, district: nextDistrict, neighborhood: nextNeighborhood }));
    }
  }, [cantons, form.canton, form.district, form.neighborhood, form.province]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));



  const saveAndContinue = async () => {
    const addressQuery = [form.province, form.canton, form.district, form.neighborhood, form.details].filter(Boolean).join(', ');
    const address = {
      province: form.province,
      canton: form.canton,
      district: form.district,
      neighborhood: form.neighborhood,
      details: form.details,
      coordinates: form.coordinates,
      locationUrl: form.locationUrl || mapsSearchUrl(form.coordinates || addressQuery),
    };

    let clientRecordId = draft.clientRecordId;
    if (!draft.isExistingClient && draft.nationalId) {
      const created = await ClientService.create({
        nationalId: draft.nationalId,
        phone: draft.phone || '',
        name: form.name,
        nickname: form.nickname,
        active: true,
        address,
      });
      clientRecordId = created.id;
    }

    saveCustomerDraft({
      clientRecordId,
      isExistingClient: true,
      name: form.name,
      nickname: form.nickname,
      address,
    });
    history.push('/customer/products');
  };

  return (
    <PublicPage title="Información del cliente" description="Complete la información del cliente y su dirección. De momento se limita a Acosta y cantones vecinos." maxW="1000px">
      <SponsorStrip type="Premium" max={4} title="Patrocinadores Premium" />
      <Box h={{ base: '20px', md: '28px' }} />
      <PublicCard>
        <Stack spacing="16px">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl isRequired><FormLabel>Nombre completo</FormLabel><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Apodo</FormLabel><Input value={form.nickname} onChange={(e) => set('nickname', e.target.value)} /></FormControl>
            <FormControl isRequired><FormLabel>Provincia</FormLabel><Select value={form.province} onChange={(e) => set('province', e.target.value)}><option value="San José">San José</option></Select></FormControl>
            <FormControl isRequired><FormLabel>Cantón</FormLabel><Select value={form.canton} onChange={(e) => { const nextCanton = e.target.value; const nextDistrict = Object.keys(locationOptions[form.province]?.[nextCanton] || {})[0] || ''; setForm((prev) => ({ ...prev, canton: nextCanton, district: nextDistrict, neighborhood: (locationOptions[form.province]?.[nextCanton]?.[nextDistrict] || [''])[0] })); }}>{cantons.map((canton) => <option key={canton} value={canton}>{canton}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Distrito</FormLabel><Select value={form.district} onChange={(e) => { const nextDistrict = e.target.value; setForm((prev) => ({ ...prev, district: nextDistrict, neighborhood: (locationOptions[form.province]?.[form.canton]?.[nextDistrict] || [''])[0] })); }}>{districts.map((district) => <option key={district} value={district}>{district}</option>)}</Select></FormControl>
            <FormControl isRequired><FormLabel>Barrio</FormLabel><Select value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)}>{neighborhoods.map((neighborhood) => <option key={neighborhood} value={neighborhood}>{neighborhood}</option>)}</Select></FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Ubicación en el mapa</FormLabel>
            <DeviceLocationMap
              coordinates={form.coordinates}
              addressQuery={[form.province, form.canton, form.district, form.neighborhood, form.details].filter(Boolean).join(', ')}
              onLocation={(location) => setForm((prev) => ({ ...prev, ...location }))}
            />
          </FormControl>
          <FormControl isRequired><FormLabel>Otras señas</FormLabel><Input value={form.details} onChange={(e) => set('details', e.target.value)} /></FormControl>
          <OrderNavigation currentStep={2} backLabel="Volver a verificación" continueLabel="Continuar al pedido" onBack={() => history.push('/customer/data')} onContinue={saveAndContinue} />
        </Stack>
      </PublicCard>
      <SponsorStrip type="Premium" max={4} offset={4} title="Más patrocinadores Premium" />
    </PublicPage>
  );
}
