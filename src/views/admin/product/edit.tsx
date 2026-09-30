import React, { useEffect, useState } from 'react';
import { Box, Button, Center, Text, useToast } from '@chakra-ui/react';
import { useHistory, useParams } from 'react-router-dom';
import ProductForm from 'components/product/ProductForm';
import productService from 'services/ProductService';
import { Product } from 'interfaces/ProductItem';
import AsyncContent from 'components/dataDisplay/AsyncContent';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product>();
  const [failed, setFailed] = useState(false);
  const toast = useToast();
  const history = useHistory();
  useEffect(() => { productService.get(id).then(data => setProduct(data as Product)).catch(() => { setFailed(true); toast({ title: 'No pudimos cargar el producto', status: 'error' }); }); }, [id, toast]);
  if (failed) return <Center pt="160px"><Box textAlign="center"><Text fontWeight="800" fontSize="xl">No pudimos abrir este producto</Text><Text color="gray.500" mt={2}>Puede que haya sido eliminado o que la conexión haya fallado.</Text><Button mt={5} colorScheme="brand" onClick={() => history.push('/admin/product/index')}>Volver al inventario</Button></Box></Center>;
  if (!product) return <AsyncContent isLoading loadingLabel="Cargando producto" />;
  return <ProductForm key={product.id} product={product} />;
}
