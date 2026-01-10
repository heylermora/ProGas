// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Form from 'components/form/Form';
import OkModal from 'components/modal/OkModal';
import Error from 'components/exceptions/Error';

import productService from 'services/ProductService';
import type { Product } from 'interfaces/Product';
import type FormField from 'interfaces/FormField';

export default function EditProduct() {
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        const data = await productService.get(id);
        if (!mounted) return;

        setDescription((data?.description ?? '').toString());
        setPrice(Number(data?.price ?? 0));
      } catch (error) {
        console.error('Error fetching product:', error);
        if (error?.response?.status !== 400) setIsError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const fields: FormField[] = useMemo(
    () => [
      {
        label: 'Descripción',
        name: 'description',
        type: 'text',
        value: description,
        validation: { required: true },
        onChange: (v: string) => setDescription(v),
        isDisabled: isLoading,
      },
      {
        label: 'Precio (CRC)',
        name: 'price',
        type: 'number',
        value: price,
        validation: { required: true, min: 1 },
        onChange: (v: any) => setPrice(Number(v)),
        isDisabled: isLoading,
      },
    ],
    [description, price, isLoading]
  );

  const handleFormSubmit = async (fieldValues: { [key: string]: any }) => {
    try {
      const edited: Product = {
        id,
        description: (fieldValues.description ?? '').trim(),
        price: Number(fieldValues.price ?? 0),
      };

      await productService.edit(id, edited);
      setShowModal(true);
    } catch (error) {
      console.error('Error updating product:', error);
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
        title="Editar Producto"
        button="Guardar Cambios"
        back="/admin/product/index"
        fields={fields}
        onSubmit={handleFormSubmit}
        isDisabled={isLoading}
      />

      {showModal && (
        <OkModal
          message="Producto actualizado correctamente."
          isOpen={showModal}
          onClose={closeModalAndRedirect}
        />
      )}
    </>
  );
}