// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Alert, AlertIcon, Box } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import Form from 'components/form/Form';
import type FormField from 'interfaces/FormField';
import ClientService from 'services/ClientService';
import { fetchClientNameByCedula } from 'services/CedulaService';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import { saveCustomerDraft } from './customerDraft';

const onlyDigits = (value: string) => String(value || '').replace(/\D/g, '');

export default function CustomerData() {
  const history = useHistory();
  const [message, setMessage] = useState('');

  const fields: FormField[] = useMemo(
    () => [
      { label: 'Cédula', name: 'nationalId', type: 'text', value: '', validation: { required: true }, helper: 'Solo para verificar si el cliente existe o debe crearse.' },
      { label: 'Teléfono', name: 'phone', type: 'text', value: '', validation: { required: true }, helper: 'Debe tener al menos 8 dígitos.' },
    ],
    []
  );

  const handleSubmit = async (values: { [key: string]: any }) => {
    const nationalId = onlyDigits(values.nationalId);
    const phoneDigits = onlyDigits(values.phone);

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
          phone: existingClient.phone || existingClient.telefono || values.phone,
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
        phone: values.phone,
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
        {message && <Alert status="warning" mb="18px" borderRadius="12px"><AlertIcon />{message}</Alert>}
        <Form title="Datos de verificación" button="Verificar y continuar" fields={fields} onSubmit={handleSubmit} />
      </PublicCard>
      <Box h={{ base: '8px', md: '12px' }} />
      <SponsorStrip type="Premium" max={4} offset={4} title="Patrocinadores" />
    </PublicPage>
  );
}
