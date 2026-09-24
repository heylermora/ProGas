import React, { useEffect, useState } from 'react';
import { Center, Spinner, useToast } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import ProductForm from 'components/product/ProductForm';
import productService from 'services/ProductService';
import { Product } from 'interfaces/ProductItem';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product>();
  const toast = useToast();
  useEffect(() => { productService.get(id).then(data => setProduct(data as Product)).catch(() => toast({ title: 'No pudimos cargar el producto', status: 'error' })); }, [id, toast]);
  if (!product) return <Center pt="160px"><Spinner size="xl" color="brand.500" /></Center>;
  return <ProductForm key={product.id} product={product} />;
}
