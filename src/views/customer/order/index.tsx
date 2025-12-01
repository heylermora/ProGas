import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, Link, useColorModeValue, SimpleGrid, IconButton, Spinner, Center} from '@chakra-ui/react';
import { Link as RLink, useParams, useHistory } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import ItemCard from 'components/card/ItemCard';
import Empty from 'components/exceptions/Empty';
import Error from 'components/exceptions/Error';
import orderService from 'services/OrderService';
import orderItem from 'interfaces/OrderItem'; // Ahora esta interfaz usa 'items: ProductItem[]'

export default function Index() {
    let { search = null } = useParams<{ search: string }>();

    const history = useHistory();
    const textColorBrand = useColorModeValue('brand.500', 'white');
    const spinnerColor = useColorModeValue('brand.700', 'white');

    const [orders, setorders] = useState<orderItem[]>([]);
    // Se usa 'uniqueStatus' como tipo 'string[]'
    const [uniqueStatus, setUniqueStatus] = useState<string[]>([]); 
    const [activeStatus, setActiveStatus] = useState('Todos');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let promise;
        setIsLoading(true);
        if (search === null || search === ':search') {
            if (activeStatus === 'Todos') {
                promise = orderService.getAll();                
            } else {
                promise = orderService.getAll(
                    ['status'], 
                    [activeStatus]
                );
            }
        } else {
            // 💡 AJUSTE: Quitamos 'name' de la búsqueda del nivel superior, ya que ahora está dentro de 'items'
            promise = orderService.getAll(
                ['client', 'orderCode'], 
                [search, search]
            );
        }
     
        promise
            .then((ordersData: orderItem[]) => {
                console.log("ordersData:", ordersData);
                setorders(ordersData);
                if (activeStatus === 'Todos') {
                    const status = ordersData.map((order) => order.status);
                    const uniqueStatus = ['Todos', ...Array.from(new Set(status))];
                    setUniqueStatus(uniqueStatus);
                }
            })
            .catch((error) => {
                console.error('Error fetching orders:', error);
                setIsError(true);
            })
            .finally(() => {
                setIsLoading(false);
            }); 
    }, [search, activeStatus]);

    const handleStatusClick = useCallback((status: string) => {
        if (status === 'Todos') {
            history.replace('/order/index');
        } 
        setActiveStatus(status);
    }, [history]);

    return (
        <Box w='100%' pt={{ base: '180px', md: '80px', xl: '80px' }}>
            {isError ? (
                <Error />
            ) : isLoading ? (
                <Center>
                    <Spinner size="xl" variant='darkBrand' color={spinnerColor} />
                </Center>
            ) : orders.length === 0 ? (
                <>
                    <IconButton
                        ml='auto'
                        mb='20px'
                        colorScheme="brand"
                        aria-label="Add order"
                        icon={<MdAdd />}
                        as={RLink}
                        padding="0px 8px"
                        borderRadius="100%"
                        to="/order/new"
                    />
                    <Empty />
                </>
            ) : (
                <Flex flexDirection='column' w='100%'>
                    <Flex
                        flexWrap="wrap"
                        align='center'
                        mb='auto'
                    >
                        {uniqueStatus.map(status => (
                            <Link
                                isTruncated
                                key={status}
                                color={textColorBrand}
                                fontWeight='500'
                                onClick={() => handleStatusClick(status)}
                                backgroundColor={activeStatus === status ? 'white' : 'transparent'}
                                borderRadius="20px"
                                p="10px"
                                m="5px"
                                maxWidth="150px"
                                flex="1"
                                textAlign="center"
                            >
                                {status}
                            </Link>
                        ))}
                        <IconButton
                            ml='auto'
                            mb='20px'
                            colorScheme="brand"
                            aria-label="Add order"
                            icon={<MdAdd />}
                            as={RLink}
                            padding="0px 8px"
                            borderRadius="100%"
                            to="/order/new"
                        />
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 4 }} gap='20px'>
                        {orders.map(order => (
							<ItemCard
										key={order.id}
										id={order.id}
										// Propiedades de la ORDEN
										client={order.client}
										code={order.orderCode}
										status={order.status} // 👈 Agregado: Estado de la orden
										requestDate={order.requestDate} // 👈 Agregado: Fecha de solicitud
										
										// Nombre del Producto (del primer ítem)
										name={order.items && order.items.length > 0 ? order.items[0].name : 'Sin Nombre'} 
									/>
													))}
                    </SimpleGrid>
                </Flex>
            )}
        </Box>
    );
}