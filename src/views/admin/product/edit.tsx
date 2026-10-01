import React, { useEffect, useState } from 'react';
import { Box, Center, Text, useToast } from '@chakra-ui/react';
import { useHistory, useParams } from 'react-router-dom';
import ProductForm from 'components/product/ProductForm';
import productService from 'services/ProductService';
import { Product } from 'interfaces/ProductItem';
import AsyncContent from 'components/dataDisplay/AsyncContent';
import BackButton from 'components/button/BackButton';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product>();
  const [failed, setFailed] = useState(false);
  const toast = useToast();
  const history = useHistory();
  useEffect(() => { productService.get(id).then(data => setProduct(data as Product)).catch(() => { setFailed(true); toast({ title: 'No pudimos cargar el producto', status: 'error' }); }); }, [id, toast]);
  if (failed) return <Center minH="70vh" pt={{ base: '110px', md: '70px' }}><Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 6, md: 10 }} textAlign="center" maxW="520px"><Text fontWeight="900" fontSize="2xl">No pudimos abrir este producto</Text><Text color="gray.500" mt={2}>Puede que haya sido eliminado o que la conexión haya fallado.</Text><BackButton mt={6} onClick={() => history.push('/admin/product/index')}>Volver al inventario</BackButton></Box></Center>;
  if (!product) return <Box pt={{ base: '120px', md: '80px' }}><AsyncContent isLoading loadingLabel="Cargando producto" /></Box>;
  return <ProductForm key={product.id} product={product} />;
}
