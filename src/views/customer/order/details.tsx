import { useState, useEffect } from 'react';
import { useParams, NavLink, Link } from 'react-router-dom';

import { Button, Center, Text, useColorModeValue, Flex } from '@chakra-ui/react';

import { formatValue } from 'utils/formatValue';
import Form from 'components/form/Form';
import OrderService from 'services/OrderService';
import OrderItem from 'interfaces/OrderItem'; // 👈 Aseguramos que la interfaz sea la de la orden
import FormField from 'interfaces/FormField';
import PurchaseOrderModal from 'components/modal/PurchaseOrderModal';
import Error from 'components/exceptions/Error';


export default function Details() {
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const { id } = useParams<{ id: string }>();
  const [fields, setFields] = useState<FormField[]>([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);


  useEffect(() => {    
    if (id) {
      OrderService.get(id)
        .then((order: OrderItem) => { // 👈 Usamos OrderItem
            
            // Verificamos si hay al menos un ítem
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

            const newFields: FormField[] = [
                // Propiedad del ÍTEM
                { label: 'Nombre del Producto', name: 'itemName', type: 'text', 
                    value: firstItem?.name || '', isDisabled: true },
                // Propiedad de la ORDEN
                { label: 'Código de Orden', name: 'orderCode', type: 'text', 
                    value: order.orderCode || '', isDisabled: true },
                { label: 'Fecha de Solicitud', name: 'requestDate', type: 'date', 
                    value: order.requestDate ? order.requestDate.split('T')[0] : '', isDisabled: true },
                { label: 'Cliente', name: 'client', type: 'text', 
                    value: order.client, isDisabled: true },
                // Propiedad del ÍTEM
                { label: 'Tipo de Gas', name: 'gasType', type: 'text', 
                    value: firstItem?.gasType || '', isDisabled: true },
                // Propiedad del ÍTEM
                { label: 'Cantidad', name: 'quantity', type: 'number', 
                    value: firstItem?.quantity.toString() || '', isDisabled: true },
                // Propiedad del ÍTEM (usamos el precio del primer ítem)
                { label: 'Precio Unitario', name: 'price', type: 'money', helper: 'Cantidad en colones', 
                    value: formatValue(firstItem?.price.toString() || '0') || '', isDisabled: true },
            ];
            setFields(newFields);
        })
        .catch((error) => {
          console.error('Error fetching order data:', error);
          setIsError(true);
        });
    }
  }, [id]);
  return (
    <>
      {isError ? (
          <Error />
        ) : fields.length > 0 && (
        <>
          <Form
            title='Detalles de la Orden' // 👈 Título actualizado
            fields={fields}
            back={null}
            onSubmit={null}
            isDisabled={true}
          />
          <Flex direction="row" mt="16px">
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              py='5px'
              w='100%'
              mr="10px"
              onClick={() => setIsTableModalOpen(true)}
            >
              Ver ingresos
            </Button>
            <Button
              as={Link}
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              py='5px'
              w='100%'
              to={`/expense/index/${id}`}
            >
              Ver gastos
            </Button>
          </Flex>
          <Center mt="8px">
            <NavLink to="/order/index">
              <Text
                color={brandStars}
                as="span"   
                fontWeight="500"
                textAlign="center"
              >
                Volver
              </Text>
            </NavLink>
          </Center>
          <PurchaseOrderModal
            title="Ordenes de Compra"
            id={id}
            isOpen={isTableModalOpen}
            onClose={() => setIsTableModalOpen(false)}
          />
        </>
          )}
    </>
    );
}