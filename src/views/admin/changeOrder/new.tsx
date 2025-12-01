// Custom components
// Custom components
import Form from 'components/form/Form';

export default function New() {
	const fields = [
		{ label: 'Identificación', type: 'text' },
		{ label: 'Monto', type: 'text' },
	  ];

	return (
		<Form
		title='Nueva Orden de Cambio'
        button='Crear Orden de Cambio'
		back=''
		fields={null}
		onSubmit={null}/>
	);
}