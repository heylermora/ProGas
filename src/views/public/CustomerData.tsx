// @ts-nocheck
import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import Form from 'components/form/Form';
import type FormField from 'interfaces/FormField';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';

export default function CustomerData() {
  const history = useHistory();

  const fields: FormField[] = useMemo(
    () => [
      { label: 'Cédula', name: 'nationalId', type: 'text', value: '', validation: { required: true }, helper: 'Se valida contra el teléfono registrado si el cliente ya existe.' },
      { label: 'Teléfono', name: 'phone', type: 'text', value: '', validation: { required: true } },
      { label: 'Nombre completo', name: 'name', type: 'text', value: '', helper: 'Requerido solo cuando el cliente es nuevo.' },
      { label: 'Apodo', name: 'nickname', type: 'text', value: '', helper: 'Opcional.' },
    ],
    []
  );

  return (
    <PublicPage
      title="Datos del cliente"
      description="Ingrese cédula y teléfono. Si no existe, el MVP permite capturar nombre y apodo opcional para registrar el cliente."
      maxW="1100px"
    >
      <PublicCard>
        <Form title="Validar cliente" button="Continuar a productos" fields={fields} onSubmit={() => history.push('/customer/products')} />
      </PublicCard>
      <SponsorStrip type="Premium" max={8} title="Patrocinadores Premium" />
    </PublicPage>
  );
}
