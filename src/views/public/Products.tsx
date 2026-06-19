// @ts-nocheck
import React from 'react';
import NewCustomerOrder from 'views/customer/order/new';
import SponsorStrip from './SponsorStrip';
import { PublicCard, PublicPage } from './PublicPage';

export default function Products() {
  return (
    <PublicPage title="Productos y pedido" description="Formulario público conectado al módulo existente de pedidos.">
      <PublicCard>
        <NewCustomerOrder />
      </PublicCard>
      <SponsorStrip type="General" max={12} title="Patrocinadores General" />
    </PublicPage>
  );
}
