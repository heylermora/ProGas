import React, { useMemo } from 'react';
import Form from 'components/form/Form';
import type FormField from 'interfaces/FormField';
import { PublicCard, PublicPage } from './PublicPage';

export default function ViewOrder() {
  const fields: FormField[] = useMemo(
    () => [{ label: 'Número de pedido o teléfono', name: 'search', type: 'text', value: '', validation: { required: true } }],
    []
  );

  return (
    <PublicPage title="Ver pedido" description="Consulta básica del pedido para el MVP." maxW="720px">
      <PublicCard>
        <Form title="Consultar pedido" button="Consultar" back="/" fields={fields} onSubmit={() => undefined} />
      </PublicCard>
    </PublicPage>
  );
}
