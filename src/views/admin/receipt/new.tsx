import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory } from 'react-router-dom';

import OkModal from 'components/modal/OkModal';
import Form from 'components/form/Form';
import ReceiptService from 'services/ReceiptService';
import ReceiptItem from 'interfaces/ReceiptItem';
import Cookies from 'js-cookie';
import Error from 'components/exceptions/Error';

export default function New() {
	const [showModal, setShowModal] = useState(false);
	const [isError, setIsError] = useState(false);
	const history = useHistory();
	const { id } = useParams<{ id: string }>();
	const projectId = Cookies.get('projectid') || '';


	const fields = [
		{ label: 'Código', name: 'code', type: 'text', value: '', validation: { required: true, maxLength: 10 } },
		{ label: 'Fecha', name: 'date', type: 'date', value: new Date().toISOString().split('T')[0], validation: { required: true } },
		{ label: 'Monto', name: 'amountUSD', type: 'money', value: '', helper: 'Ingresa la cantidad en dólares', validation: { required: true, maxLength: 21, regex: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/ } },
		{ label: 'Monto', name: 'amountCOL', type: 'money', value: '', helper: 'Ingresa la cantidad en colones', validation: { required: true, maxLength: 21, regex: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/ } },
	];

		const handleFormSubmit = async (fieldValues: {[key: string]: string}) => {
		if (id) {
			
			const NewReceipt: ReceiptItem = {
				id: uuidv4(),
				invoiceId: id,
				code: fieldValues.code,
				date: `${fieldValues.date}T00:00:00Z`,
				amountUSD: parseFloat(fieldValues.amountUSD),
				amountCOL: parseFloat(fieldValues.amountCOL),
			};
	
			ReceiptService.create(NewReceipt)
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
		}
	};

	const closeModalAndRedirect = () => {
        setShowModal(false);
        history.push(`/project/details/${projectId}`);
    };

	return (
		isError ? (
        	<Error />
      	) : (
			<>
				<Form
				title='Nuevo Recibo'
				button='Crear Recibo'
				back={`/project/details/${projectId}`}
				fields={fields}
				onSubmit={handleFormSubmit}/>

				{showModal && <OkModal message="Recibo creado correctamente." isOpen={showModal} onClose={closeModalAndRedirect} />}
			</>
		)
	);
}