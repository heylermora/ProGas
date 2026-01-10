// @ts-nocheck
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  IconButton,
  Button,
  Stack,
  Input,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { Link as RLink, useParams, useHistory } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

import Card from 'components/card/Card';
import Empty from 'components/exceptions/Empty';
import Error from 'components/exceptions/Error';

import productService from 'services/ProductService';
import type { Product } from 'interfaces/Product';

export default function Index() {
  const inputBg = useColorModeValue('white', 'navy.800');
  const params = useParams<{ search?: string }>();
  const history = useHistory();

  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const spinnerColor = useColorModeValue('brand.700', 'white');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  // Soporta /admin/product/index/:search como el de orders (si aplica)
  const routeSearch = params.search ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchInput, setSearchInput] = useState<string>(
    routeSearch && routeSearch !== ':search' ? routeSearch : ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const term = (routeSearch && routeSearch !== ':search' ? routeSearch : searchInput)
        ?.trim()
        ?.toUpperCase();

      const data =
        term && term.length > 0
          ? await productService.getAll(['description'], [term])
          : await productService.getAll();

      setProducts(data as Product[]);
    } catch (e) {
      console.error('Error fetching products:', e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [routeSearch, searchInput]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onSearch = useCallback(() => {
    const term = searchInput?.trim();
    if (!term) {
      history.replace('/admin/products/index');
      fetchProducts();
      return;
    }
    history.replace(`/admin/product/index/${encodeURIComponent(term)}`);
    // fetchProducts se vuelve a disparar por routeSearch
  }, [searchInput, history, fetchProducts]);

  const onClearSearch = useCallback(() => {
    setSearchInput('');
    history.replace('/admin/product/index');
    fetchProducts();
  }, [history, fetchProducts]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await productService.delete(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (e) {
        console.error('Error deleting product:', e);
        setIsError(true);
      }
    },
    []
  );

  const visibleProducts = useMemo(() => products ?? [], [products]);

  const topPt = { base: '180px', md: '80px', xl: '80px' };

  return (
    <Box w="100%" pt={topPt}>
      {isError ? (
        <Error />
      ) : isLoading ? (
        <Center>
          <Spinner size="xl" variant={'darkBrand' as any} color={spinnerColor as any} />
        </Center>
      ) : visibleProducts.length === 0 ? (
        <>
          <Flex align="center" gap="10px" mb="20px" flexWrap="wrap">
            <HStack spacing="10px" flex="1" minW={{ base: '100%', md: '420px' }}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por descripción..."
                bg={inputBg}
                borderColor={borderColor}
              />
              <IconButton
                aria-label="Buscar"
                icon={<MdSearch />}
                colorScheme="brand"
                onClick={onSearch}
              />
              <Button variant="outline" onClick={onClearSearch}>
                Limpiar
              </Button>
            </HStack>

            <IconButton
              ml="auto"
              colorScheme="brand"
              aria-label="Add product"
              icon={<MdAdd />}
              as={RLink as any}
              borderRadius="100%"
              to="/admin/product/new"
            />
          </Flex>

          <Empty />
        </>
      ) : (
        <Flex direction="column" w="100%">
          {/* Header (Horizon style) */}
          <Flex align="center" gap="10px" mb="20px" flexWrap="wrap">
            <Text color={textColor} fontSize="xl" fontWeight="700">
              Productos
            </Text>

            <HStack spacing="10px" flex="1" minW={{ base: '100%', md: '420px' }}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por descripción..."
                bg={inputBg}
                borderColor={borderColor}
              />
              <Button variant="outline" onClick={onClearSearch}>
                Limpiar
              </Button>
            </HStack>

            <IconButton
              ml="auto"
              colorScheme="brand"
              aria-label="Add product"
              icon={<MdAdd />}
              as={RLink as any}
              borderRadius="100%"
              to="/admin/product/new"
            />
          </Flex>

          {/* List (simple, Horizon card) */}
          <Card p="0px" overflow="hidden">
            <Box px="18px" py="14px">
              <Flex align="center">
                <Text flex="1" color={textColorSecondary} fontSize="sm" fontWeight="600">
                  DESCRIPCIÓN
                </Text>
                <Text w={{ base: '110px', md: '140px' }} textAlign="right" color={textColorSecondary} fontSize="sm" fontWeight="600">
                  PRECIO
                </Text>
                <Text w={{ base: '140px', md: '180px' }} textAlign="right" color={textColorSecondary} fontSize="sm" fontWeight="600">
                  ACCIONES
                </Text>
              </Flex>
            </Box>

            <Divider borderColor={borderColor} />

            <Stack spacing="0px">
              {visibleProducts.map((p) => (
                <Box
                  key={p.id}
                  px="18px"
                  py="14px"
                  _hover={{ bg: hoverBg }}
                  transition="background-color 0.2s"
                >
                  <Flex align="center" gap="12px">
                    <Box flex="1" minW="0">
                      <Text color={textColor} fontWeight="700" noOfLines={1}>
                        {p.description}
                      </Text>
                      <Text color={textColorSecondary} fontSize="sm" noOfLines={1}>
                        ID: {p.id}
                      </Text>
                    </Box>

                    <Text
                      w={{ base: '110px', md: '140px' }}
                      textAlign="right"
                      color={textColor}
                      fontWeight="700"
                    >
                      {typeof p.price === 'number'
                        ? p.price.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })
                        : (p.price as any)}
                    </Text>

                    <HStack w={{ base: '140px', md: '180px' }} justify="flex-end" spacing="8px">
                      <IconButton
                        aria-label="Editar"
                        icon={<MdEdit />}
                        as={RLink as any}
                        to={`/admin/product/edit/${p.id}`}
                        variant="outline"
                        size="sm"
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<MdDelete />}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Card>
        </Flex>
      )}
    </Box>
  );
}