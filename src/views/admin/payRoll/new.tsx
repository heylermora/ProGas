import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory } from 'react-router-dom';

import OkModal from 'components/modal/OkModal';
import Form from 'components/form/Form';
import PayRollService from 'services/PayRollService';
import PayRollItem from 'interfaces/PayRollItem';
import Error from 'components/exceptions/Error';

export default function New() {
	const [showModal, setShowModal] = useState(false);
	const [isError, setIsError] = useState(false);
	const history = useHistory();
	const { id } = useParams<{ id: string }>();

	const fields = [
		{ label: 'Nombre', name: 'name', type: 'text', value: '', validation: { required: true, maxLength: 50 } },
		{ label: 'Fecha', name: 'date', type: 'date', value: new Date().toISOString().split('T')[0], validation: { required: true } },
		{ label: 'Salario', name: 'salary', type: 'money', value: '', helper: 'Ingresa la cantidad en colones', validation: { required: true, maxLength: 21, regex: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/ } },
		{ label: 'Salario + Cargas Sociales', name: 'socialChanges', type: 'money', value: '0', helper: 'Cantidad en colones', validation: { required: true, maxLength: 21, regex: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/ }, disabled: true },
		{ label: 'Salario por hora', name: 'hourlySalary', type: 'money', value: '0', helper: 'Cantidad en colones', validation: { required: true, maxLength: 21, regex: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/ }, disabled: true },
		{ label: 'Salario por hora adicional', name: 'overtimeSalary', type: 'money', value: '', helper: 'Ingresa la cantidad en colones' },
		{ label: 'Horas laboradas', name: 'workedHours', type: 'number', value: '', validation: { required: true, maxLength: 10 } },
		{ label: 'Horas adicionales', name: 'overtimeHours', type: 'number', value: '', validation: { required: true, maxLength: 10 } },
		{ label: 'Gasto por salario', name: 'expenseSalary', type: 'money', value: '0', validation: { required: true, maxLength: 10 }, disabled: true },
		{ label: 'Gasto por salario extra', name: 'expenseOvertime', type: 'money', value: '0', validation: { required: true, maxLength: 10 }, disabled: true },
		{ label: 'Gasto total', name: 'amountCOL', type: 'money', value: '0', helper: 'Cantidad en colones', validation: { required: true, maxLength: 10 }, disabled: true },
		{ label: 'Gasto total', name: 'amountUSD', type: 'money', value: '0', helper: 'Cantidad en dólares', validation: { required: true, maxLength: 10 }, disabled: true },
	];

	const handleFormSubmit = async (fieldValues: {[key: string]: string}) => {
		if (id) {
			const newPayRoll: PayRollItem = {
				id: uuidv4(),
				projectId: id,
				date: `${fieldValues.date}T00:00:00Z`,
				amountUSD: parseFloat(fieldValues.amountUSD),
				amountCOL: parseFloat(fieldValues.amountCOL),
				name: fieldValues.name,
				socialChanges: parseFloat(fieldValues.socialChanges),
				hourlySalary: parseFloat(fieldValues.hourlySalary),
				overtimeSalary: parseFloat(fieldValues.overtimeSalary),
				workedHours: parseFloat(fieldValues.workedHours),
				overtimeHours: parseFloat(fieldValues.overtimeHours),
			};
	
			PayRollService.create(newPayRoll)
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
        history.push(`/expense/index/${id}`);
    };

	return (
		isError ? (
        	<Error />
      	) : (
			<>
				<Form
				title='Nueva Planilla'
				button='Crear Planilla'
				back={`/expense/index/${id}`}
				fields={fields}
				onSubmit={handleFormSubmit}/>

				{showModal && <OkModal message="Planilla creada correctamente." isOpen={showModal} onClose={closeModalAndRedirect} />}
			</>
		)
	);
}