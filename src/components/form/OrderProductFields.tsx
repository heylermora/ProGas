import { Input, Select, SimpleGrid } from '@chakra-ui/react';
import type { Product } from 'interfaces/ProductItem';
import { ChangeEvent } from 'react';
import FormField from './FormField';

type Props = {
  form: { productId: string; quantity: number; price: number; comment: string };
  catalog: Product[];
  loading: boolean;
  selectedProduct?: Product;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};
export default function OrderProductFields({ form, catalog, loading, selectedProduct, onChange }: Props) {
  return <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
    <FormField label="Producto" isRequired isDisabled={loading || !catalog.length} help={selectedProduct ? `Precio actual: ₡${Number(selectedProduct.price ?? 0)}` : undefined}>
      <Select name="productId" value={form.productId} onChange={onChange}>
        {catalog.map(product => <option key={product.id} value={product.id}>{product.description}</option>)}
      </Select>
    </FormField>
    <FormField label="Cantidad" isRequired><Input name="quantity" type="number" min={1} value={form.quantity} onChange={onChange} /></FormField>
    <FormField label="Precio" isDisabled><Input name="price" type="number" value={form.price} readOnly /></FormField>
    <FormField label="Comentario"><Input name="comment" value={form.comment} onChange={onChange} placeholder="Opcional" /></FormField>
  </SimpleGrid>;
}
