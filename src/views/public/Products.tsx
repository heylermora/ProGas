// @ts-nocheck
import React, { useMemo } from 'react';
import Form from 'components/form/Form';
import type FormField from 'interfaces/FormField';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';

export default function Products() {
  const fields: FormField[] = useMemo(
    () => [
      { label: 'Producto', name: 'product', type: 'select', value: ['Gas', 'Cilindro', 'Recarga', 'Accesorio'], validation: { required: true } },
      { label: 'Cantidad', name: 'quantity', type: 'number', value: 1, validation: { required: true } },
      { label: 'Datos del cilindro', name: 'cylinderDetails', type: 'text', value: '', helper: 'Tipo / tamaño si aplica.' },
      { label: 'Provincia', name: 'province', type: 'text', value: '' },
      { label: 'Cantón', name: 'canton', type: 'text', value: '' },
      { label: 'Distrito', name: 'district', type: 'text', value: '' },
      { label: 'Barrio', name: 'neighborhood', type: 'text', value: '' },
      { label: 'Otras señas', name: 'notes', type: 'text', value: '' },
      { label: 'GPS o enlace', name: 'locationUrl', type: 'text', value: '' },
      { label: 'Transporte', name: 'transport', type: 'text', value: '', helper: 'Si aplica.' },
      { label: 'Método de pago', name: 'paymentMethod', type: 'select', value: ['Efectivo', 'SINPE', 'Otro'], validation: { required: true } },
    ],
    []
  );

  return (
    <PublicPage title="Productos y pedido" description="Formulario público inicial para seleccionar productos, dirección, transporte y pago.">
      <PublicCard>
        <Form title="Confirmar pedido" button="Confirmar pedido" fields={fields} onSubmit={() => undefined} />
      </PublicCard>
      <SponsorStrip type="General" max={12} title="Patrocinadores General" />
    </PublicPage>
  );
}
