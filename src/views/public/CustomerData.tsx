// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { Alert, AlertIcon } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import Form from 'components/form/Form';
import type FormField from 'interfaces/FormField';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';
import { saveCustomerDraft } from './customerDraft';

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

  const handleSubmit = (values: { [key: string]: any }) => {
    const phoneDigits = String(values.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      setMessage('El número de teléfono no es válido. Debe tener al menos 8 dígitos.');
      return;
    }

    saveCustomerDraft({ nationalId: values.nationalId, phone: values.phone });
    history.push('/customer/info');
  };

  return (
    <PublicPage
      title="Verificación del cliente"
      description="Primero solicitamos únicamente cédula y teléfono para validar si el cliente existe, si debe crearse o si el número no es válido."
      maxW="900px"
    >
      <PublicCard>
        {message && <Alert status="warning" mb="18px" borderRadius="12px"><AlertIcon />{message}</Alert>}
        <Form title="Datos de verificación" button="Verificar y continuar" fields={fields} onSubmit={handleSubmit} />
      </PublicCard>
      <SponsorStrip type="Premium" max={8} title="Patrocinadores Premium" />
    </PublicPage>
  );
}
