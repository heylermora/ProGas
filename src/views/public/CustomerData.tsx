// @ts-nocheck
import React, { useState } from 'react';
import { Alert, AlertIcon, Box, FormControl, FormHelperText, FormLabel, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import ClientService from 'services/ClientService';
import { fetchClientNameByCedula } from 'services/CedulaService';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import OrderNavigation from './OrderNavigation';
import { saveCustomerDraft } from './customerDraft';

const onlyDigits = (value: string) => String(value || '').replace(/\D/g, '');

export default function CustomerData() {
  const history = useHistory();
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nationalId: '', phone: '' });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleContinue = async () => {
    const nationalId = onlyDigits(form.nationalId);
    const phoneDigits = onlyDigits(form.phone);

    if (!nationalId) {
      setMessage('Ingrese la cédula para continuar.');
      return;
    }

    if (phoneDigits.length < 8) {
      setMessage('El número de teléfono no es válido. Debe tener al menos 8 dígitos.');
      return;
    }

    try {
      const existingClient = await ClientService.getByNationalId(nationalId);

      if (existingClient) {
        const savedPhone = onlyDigits(existingClient.phone || existingClient.telefono);
        if (savedPhone && savedPhone !== phoneDigits) {
          setMessage('El teléfono no coincide con el registrado para esta cédula.');
          return;
        }

        saveCustomerDraft({
          nationalId,
          phone: existingClient.phone || existingClient.telefono || form.phone,
          clientRecordId: existingClient.id,
          isExistingClient: true,
          name: existingClient.name,
          nickname: existingClient.nickname,
          address: existingClient.address,
        });
        history.push('/customer/info');
        return;
      }

      const apiName = await fetchClientNameByCedula(nationalId);
      saveCustomerDraft({
        nationalId,
        phone: form.phone,
        isExistingClient: false,
        name: apiName || '',
      });
      history.push('/customer/info');
    } catch (error) {
      setMessage('No se pudo verificar el cliente. Intente nuevamente.');
    }
  };

  return (
    <PublicPage
      title="Verificación del cliente"
      description="Primero consultamos nuestros registros por cédula. Solo si el cliente no existe usamos la API externa para sugerir el nombre."
      maxW="900px"
    >
      <SponsorStrip type="Premium" max={4} title="Patrocinadores" />
      <Box h={{ base: '8px', md: '12px' }} />
      <PublicCard>
        <Stack spacing="18px">
          {message && <Alert status="warning" borderRadius="12px"><AlertIcon />{message}</Alert>}
          <Stack spacing="4px">
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="900">Datos de verificación</Text>
            <Text color="gray.500" fontSize="sm">Usamos estos datos para validar el cliente antes de armar el pedido.</Text>
          </Stack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl isRequired>
              <FormLabel>Cédula</FormLabel>
              <Input value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} placeholder="Ej. 101110111" />
              <FormHelperText>Solo para verificar si el cliente existe o debe crearse.</FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Teléfono</FormLabel>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Ej. 8888-8888" />
              <FormHelperText>Debe tener al menos 8 dígitos.</FormHelperText>
            </FormControl>
          </SimpleGrid>
          <OrderNavigation currentStep={1} backLabel="Volver al inicio" continueLabel="Verificar y continuar" onBack={() => history.push('/')} onContinue={handleContinue} />
        </Stack>
      </PublicCard>
      <Box h={{ base: '8px', md: '12px' }} />
      <SponsorStrip type="Premium" max={4} offset={4} title="Patrocinadores" />
    </PublicPage>
  );
}
