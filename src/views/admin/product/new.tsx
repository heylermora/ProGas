// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Form from 'components/form/Form';
import OkModal from 'components/modal/OkModal';
import Error from 'components/exceptions/Error';

import productService from 'services/ProductService';
import type { Product } from 'interfaces/Product';
import type FormField from 'interfaces/FormField';

export default function NewProduct() {
  const history = useHistory();

  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);

  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);

  const fields: FormField[] = useMemo(
    () => [
      {
        label: 'Descripción',
        name: 'description',
        type: 'text',
        value: description,
        validation: { required: true },
        onChange: (v: string) => setDescription(v),
      },
      {
        label: 'Precio (CRC)',
        name: 'price',
        type: 'number',
        value: price,
        validation: { required: true, min: 1 },
        onChange: (v: any) => setPrice(Number(v)),
      },
    ],
    [description, price]
  );

  const handleFormSubmit = async (fieldValues: { [key: string]: any }) => {
    try {
      const newProduct: Omit<Product, 'id'> = {
        description: (fieldValues.description ?? '').trim(),
        price: Number(fieldValues.price ?? 0),
      };

      await productService.create(newProduct);
      setShowModal(true);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error?.response?.status !== 400) setIsError(true);
    }
  };

  const closeModalAndRedirect = () => {
    setShowModal(false);
    history.push('/admin/product/index');
  };

  if (isError) return <Error />;

  return (
    <>
      <Form
        title="Nuevo Producto"
        button="Crear Producto"
        back="/admin/product/index"
        fields={fields}
        onSubmit={handleFormSubmit}
      />

      {showModal && (
        <OkModal
          message="Producto creado correctamente."
          isOpen={showModal}
          onClose={closeModalAndRedirect}
        />
      )}
    </>
  );
}