import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Form from 'components/form/Form';
import OkModal from 'components/modal/OkModal';
import PurchaseOrderService from 'services/PurchaseOrderService';
import FormField from 'interfaces/FormField';
import PurchaseOrderItem from 'interfaces/PurchaseOrderItem';

export default function Edit() {
	const { id } = useParams<{ id: string }>();
	const [showModal, setShowModal] = useState(false);
	const [fields, setFields] = useState<FormField[]>([]);
	useEffect(() => {
		if (id) {
			PurchaseOrderService.get(id)
			.then((purchaseOrder: PurchaseOrderItem) => {
				const newFields: FormField[] = [
					{ label: 'Id Proyecto', name: 'projectId', type: 'text', value: purchaseOrder.projectId || '' },
					{ label: 'Código', name: 'code', type: 'text', value: purchaseOrder.code || '' },
					{ label: 'Fecha', name: 'date', type: 'date', value: purchaseOrder.date || '' },
					{ label: 'Monto', name: 'amountUSD', type: 'number', value: purchaseOrder.amountUSD || '' },
					{ label: 'Monto', name: 'amountCOL', type: 'number', value: purchaseOrder.amountCOL || '' },
				];
				setFields(newFields);
			})
			.catch((error) => {
				console.error('Error fetching project data:', error);
			});
		}
		}, [id]);

	const handleFormSubmit = async (fieldValues: {[key: string]: string}) => {
		const editedPurchaseOrder: PurchaseOrderItem = {
			id: id,
			projectId: fieldValues.code,
			code: fieldValues.code,
			date: fieldValues.date,
			amountUSD: parseFloat(fieldValues.amountUSD),
			amountCOL: parseFloat(fieldValues.amountCOL),
		};

		PurchaseOrderService.edit(id, editedPurchaseOrder)
			.then((response) => {
				console.log('Ok:', response);
				setShowModal(true);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	};
	

	const closeModalAndRedirect = () => {
        setShowModal(false);
        window.location.href = '/project/index';
    };

	return (
		
		fields.length > 0 && (
			<>
				<Form
				title='Actualización de Proyecto'
				button='Actualizar Proyecto'
				back=''
				fields={fields}
				onSubmit={handleFormSubmit}/>
				{showModal && <OkModal message="Proyecto editado correctamente." isOpen={showModal} onClose={closeModalAndRedirect} />}
			</>
		)
	);
}