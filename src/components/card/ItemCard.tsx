import React, { useState } from 'react';
import {Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; 
// Custom components
import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';

interface ItemCardProps {
    id: string;
    name: string; // Nombre del Producto (viene del primer ítem)
    client: string;
    code: string | number; // orderCode
    status: string; // Estado de la orden
    requestDate: string; // Fecha de la solicitud (ISO string)
}


export default function ItemCard(props: ItemCardProps) {
    const { id, name, client, code, status, requestDate } = props;
    const [state] = useState({ id });
    const textColor = useColorModeValue('navy.700', 'white');
    const textColorBid = useColorModeValue('brand.500', 'white');
    const secondaryTextColor = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

    // 💡 AJUSTE DE FECHA: Usando métodos nativos de JavaScript
    const dateOptions: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    };
    const formattedDate = requestDate 
        ? new Date(requestDate).toLocaleDateString('es-ES', dateOptions) 
        : 'N/A';
    
    return (
        <Card p='20px'>
            <Flex direction={{ base: 'column' }} justify='center'>
                
                {/* Código de Orden y Menú */}
                <Box position='relative' display='flex' alignItems='center' mb='10px'>
                    <Text isTruncated fontWeight='700' fontSize='sm' color={textColorBid}>
                        Código: {code}
                    </Text>
                    <Menu
                        ml='auto'
                        id={ id }
                        name={name} 
                    />
                </Box>
                
                {/* Título y Cliente */}
                <Flex flexGrow={1} flexDirection='column' justify='space-between' h='100%'>
                    <Flex
                        justify='space-between'
                        direction={{
                            base: 'column', 
                            md: 'row'
                        }}
                        mb='10px'> 
                        
                        <Flex direction='column' minW={{base: '100%', md: '50%'}}>
                            {/* Nombre del Producto */}
                            <Text 
                                isTruncated
                                color={textColor}
                                fontSize='lg' 
                                mb='5px'
                                fontWeight='bold'
                                me='14px'>
                                {name}
                            </Text>
                            {/* Nombre del Cliente */}
                            <Text
                                isTruncated
                                color={secondaryTextColor}
                                fontSize='sm'
                                fontWeight='400'
                                me='14px'>
                                Cliente: {client}
                            </Text>
                        </Flex>

                        {/* Estado y Fecha */}
                        <Flex direction='column' mt={{base: '10px', md: '0'}} align={{base: 'flex-start', md: 'flex-end'}} minW={{base: '100%', md: '50%'}}>
                            <Text fontWeight='600' fontSize='sm' color={status === 'Nuevo' ? 'green.500' : secondaryTextColor}>
                                Estado: {status}
                            </Text>
                            <Text fontWeight='400' fontSize='xs' color={secondaryTextColor}>
                                Fecha: {formattedDate}
                            </Text>
                        </Flex>

                    </Flex>
                </Flex>
                
                {/* Botón Ver más */}
                <Box pt='15px'>
                    <Link
                        to={{
                            pathname: `/order/details/${id}`, 
                            state,
                        }}
                    >
                        <Button
                            variant='darkBrand'
                            color='white'
                            fontSize='sm'
                            fontWeight='500'
                            borderRadius='70px'
                            py='5px'
                            w='100%'
                        >
                            Ver detalles
                        </Button>
                    </Link>
                </Box>
            </Flex>
        </Card>
    );
}