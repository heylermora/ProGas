import { useState, useMemo, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // 👈 Se agrega la importación de UUID

import Form from 'components/form/Form';
import OkModal from 'components/modal/OkModal';
import GasOrderService from 'services/OrderService';
import { fetchClientNameByCedula } from 'services/CedulaService';
import OrderItem from 'interfaces/OrderItem'; // Suponemos que esta es la interfaz de la ORDEN
import FormField from 'interfaces/FormField';
import Error from 'components/exceptions/Error';

export default function NewGasOrder() {
    const [showModal, setShowModal] = useState(false);
    const [isError, setIsError] = useState(false);
    const [clientId, setClientId] = useState('');
    const [clientName, setClientName] = useState('');

    const history = useHistory();

    const handleCedulaChange = useCallback(async (newValue: string) => {
        setClientId(newValue);

        if (newValue.length === 0) {
            setClientName('');
            return;
        }

        if (/^\d+$/.test(newValue) && newValue.length > 0) {
            try {
                const name = await fetchClientNameByCedula(newValue);
                setClientName(name);
                console.log(`El nombre es: ${name}`);
            } catch (error) {
                console.error("Error al buscar el nombre:", error);
                setClientName('');
            }
        } else {
            setClientName('');
        }
    }, []);

    const fields: FormField[] = useMemo(() => ([
        {
            label: 'Cédula del cliente',
            name: 'clientId',
            type: 'text',
            value: clientId,
            helper: clientName ? '¡Cliente encontrado!' : 'Sin espacios ni guiones. Solo dígitos.',
            validation: {
                required: true,
                pattern: /^\d+$/, // Solo dígitos
            },
            onChange: handleCedulaChange
        },
        {
            label: 'Nombre del cliente',
            name: 'clientName',
            type: 'text',
            value: clientName ? clientName : '',
            validation: { required: true },
            isDisabled: true // Deshabilitado para autocompletado
        },
        {
            label: 'Fecha y hora de solicitud',
            name: 'requestDateTime',
            type: 'datetime-local',
            value: new Date().toISOString().slice(0, 16),
            validation: { required: true },
            isDisabled: true
        },
        // 👇 Estos campos ahora son la información del producto
        { label: 'Tipo de Gas', name: 'gasType', type: 'select', value: ['Tipo 1', 'Tipo 2', 'Tipo 3'], validation: { required: true } },
        { label: 'Cantidad', name: 'quantity', type: 'number', value: '1', validation: { required: true } } ,
        { label: 'Ubicación', name: 'location', type: 'location', helper: 'Mueva el marcador solo si necesita ajustar la ubicación', value: '' },
    ]), [clientId, clientName, handleCedulaChange]);

    const handleFormSubmit = async (fieldValues: {[key: string]: string}) => {
        
        // Genera el ID único de la orden
        const orderId = uuidv4();
        
        const newOrder: OrderItem = {
            // 1. ID de la Orden (UUID único)
            id: orderId, 
            
            // 2. Código corto de 6 caracteres (nanoid)
            orderCode: nanoid(6),
            
            // Propiedades de la ORDEN
            status: 'Nuevo',
            requestDate: fieldValues.requestDateTime,
            client: fieldValues.clientName,
            location: fieldValues.location,
            comment: "", // Comentario a nivel de orden
            
            // 3. ITEMS (Lista de Productos)
            items: [
                {
                    // ID del Producto (usando un nanoid corto de 4 caracteres para el item)
                    productId: nanoid(4), 
                    
                    // Nota: 'name' no viene del formulario, se puede establecer como un valor fijo o usar 'gasType'
                    name: `Pedido de ${fieldValues.gasType}`, // Se genera el nombre del producto
                    
                    // Los datos del producto vienen directamente de los fieldValues
                    gasType: fieldValues.gasType,
                    quantity: parseFloat(fieldValues.quantity),
                    // Se asume que no hay un campo 'price' en el formulario, se usa un valor por defecto o calculado
                    price: parseFloat(fieldValues.price || "1"), 
                    comment: fieldValues.comment || "", // Comentario a nivel de item (si existe un campo 'comment' en el formulario)
                }
            ],
            // Los campos 'name', 'gasType', 'quantity', y 'price' se eliminaron del nivel superior de newOrder
        };
        
        // 🚨 Opcional: Si necesitas el ID del cliente para el objeto (no lo usas como ID de la orden)
        // Puedes agregarlo como una propiedad adicional en el objeto newOrder si es necesario para el backend.
        // newOrder.clientId = fieldValues.clientId; 

        GasOrderService.create(newOrder)
            .then((response) => {
                console.log('Ok:', response);
                setShowModal(true);
            })
            .catch((error) => {
                console.error('Error:', error);
                if (error?.response?.status !== 400) {
                    setIsError(true);
                }
            });
    };

    const closeModalAndRedirect = () => {
        setShowModal(false);
        history.push('/order/index');
    };

    return (
        isError ? (
            <Error />
        ) : (
        <>
            <Form
                title='Nuevo Pedido de Gas'
                button='Crear Pedido'
                back='/gas-order/index'
                fields={fields}
                onSubmit={handleFormSubmit}
            />

            {showModal && <OkModal message="Pedido de Gas creado correctamente." isOpen={showModal} onClose={closeModalAndRedirect} />}
        </>
        )
    );
}