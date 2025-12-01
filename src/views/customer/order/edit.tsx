import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { formatValue } from 'utils/formatValue';
import Form from 'components/form/Form';
import OkModal from 'components/modal/OkModal';
import OrderService from 'services/OrderService';
import OrderItem from 'interfaces/OrderItem'; // Interfaz para la Orden
import { ProductItem } from 'interfaces/OrderItem'; // Asegúrate de importar ProductItem si está separado, o úsala directamente si está anidada
import FormField from 'interfaces/FormField';
import Error from 'components/exceptions/Error';


export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const [showModal, setShowModal] = useState(false);
    const [fields, setFields] = useState<FormField[]>([]);
    const [isError, setIsError] = useState(false);
    const history = useHistory();

    // Estado para guardar la orden completa (incluye el ID del producto existente)
    const [existingOrderData, setExistingOrderData] = useState<OrderItem | null>(null);

    useEffect(() => {
        if (id) {
            OrderService.get(id)
            .then((order: OrderItem) => {
                setExistingOrderData(order); // Guarda la orden completa

                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                const priceValue = firstItem ? firstItem.price.toString() : '0';

                const newFields: FormField[] = [
                    // Propiedades de la ORDEN
                    { label: 'Cliente', name: 'client', type: 'text', value: order.client || '', validation: { required: true, maxLength: 50 } },
                    { label: 'Código de Orden', name: 'orderCode', type: 'text', value: order.orderCode || '', validation: { required: true, maxLength: 6 } },
                    { label: 'Fecha de Solicitud', name: 'requestDate', type: 'date', value: order.requestDate.split('T')[0] || '', validation: { required: true } },
                    { label: 'Ubicación', name: 'location', type: 'location', value: order.location || '' },
                    { label: 'Comentario de Orden', name: 'comment', type: 'textarea', value: order.comment || '' },

                    // Propiedades del PRODUCTO (Primer Ítem)
                    { label: 'Nombre del Producto', name: 'itemName', type: 'text', value: firstItem?.name || '', validation: { required: true, maxLength: 50 } },
                    { label: 'Tipo de Gas', name: 'gasType', type: 'select', value: [firstItem?.gasType || 'Tipo 1', 'Tipo 1', 'Tipo 2', 'Tipo 3'], validation: { required: true } },
                    { label: 'Cantidad', name: 'quantity', type: 'number', value: firstItem?.quantity.toString() || '1', validation: { required: true } },
                    { label: 'Precio Unitario', name: 'price', type: 'money', helper: 'Cantidad en colones', 
                        value: formatValue(priceValue) || '', validation: { required: true, maxLength: 21, regex: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/ } },
                ];
                setFields(newFields);
            })
            .catch((error) => {
                console.error('Error fetching order data:', error);
                setIsError(true);
            });
        }
    }, [id]);

    const handleFormSubmit = async (fieldValues: {[key: string]: string}) => {
        if (!existingOrderData) {
             console.error('Datos de la orden no cargados.');
             setIsError(true);
             return;
        }

        const firstItem = existingOrderData.items && existingOrderData.items.length > 0 
            ? existingOrderData.items[0] 
            : null;
        
        // 1. Crear la lista de ítems actualizada
        const updatedItems: ProductItem[] = firstItem ? [{
            // Mantenemos el ID original del producto
            productId: firstItem.productId, 
            
            // Datos del formulario
            name: fieldValues.itemName,
            gasType: fieldValues.gasType,
            quantity: parseFloat(fieldValues.quantity),
            price: parseFloat(fieldValues.price.replace(/,/g, '')), 
            comment: fieldValues.comment || firstItem.comment || '', // Usar comentario del formulario si existe, sino el existente
        }] as ProductItem[] : []; // Aseguramos el casteo a ProductItem[]
        
        // 2. Añadir el resto de ítems sin modificar (soluciona el TS2345)
        if (existingOrderData.items && existingOrderData.items.length > 1) {
            updatedItems.push(...existingOrderData.items.slice(1));
        }

        const editedOrder: OrderItem = {
            id: id,
            // Propiedades de la ORDEN actualizadas
            status: existingOrderData.status, 
            orderCode: fieldValues.orderCode,
            requestDate: `${fieldValues.requestDate}T00:00:00Z`,
            client: fieldValues.client,
            location: fieldValues.location,
            comment: fieldValues.comment || '', 
            
            // Lista de productos
            items: updatedItems,
        };

        OrderService.edit(id, editedOrder)
            .then((response) => {
                console.log('Ok:', response);
                setShowModal(true);
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsError(true);
            });
    };
    

    const closeModalAndRedirect = () => {
        setShowModal(false);
        history.push('/order/index');
    };

    return (
        isError ? (
            <Error />
        ) : fields.length > 0 && (
            <>
                <Form
                title='Actualización de Orden'
                button='Actualizar Orden'
                back='/order/index'
                fields={fields}
                onSubmit={handleFormSubmit}/>
                {showModal && <OkModal message="Orden editada correctamente." isOpen={showModal} onClose={closeModalAndRedirect} />}
            </>
        )
    );
}