import { Icon } from '@chakra-ui/react';
import { MdHome, MdBarChart, MdLock } from 'react-icons/md';

// Orders Imports
import Orders from 'views/customer/order';
import NewOrder from 'views/customer/order/new';
import DetailsOrder from 'views/customer/order/details';
import EditOrder from 'views/customer/order/edit';

// PurchaseOrder Imports
import NewPurchaseOrder from 'views/admin/purchaseOrder/new';
import EditPurchaseOrder from 'views/admin/purchaseOrder/edit';

// Invoice Imports 
import NewInvoice from 'views/admin/invoice/new';

// Receipt Imports
import NewReceipt from 'views/admin/receipt/new';

// Expense Imports 
import Expenses from 'views/admin/expense/index';
import NewPayRoll from 'views/admin/payRoll/new';
import NewMaterialRequest from 'views/admin/materialRequest/new';
import NewReimbursement from 'views/admin/reimbursement/new';
import NewService from 'views/admin/service/new';

// Dashboard Imports
import Dashboard from "views/admin/dashboard";

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';

const routes = [
	{
		name: 'Pedidos',
		layout: '/order',
		path: '/index/:search?',
		icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
		component: Orders,
	},
	{
		name: 'Detalles del Perdido',
		layout: '/order',
		path: '/details/:id',
		component: DetailsOrder,
		secondary: true
	},
	{
		name: 'Nuevo Perdido',
		layout: '/order',
		path: '/new',
		component: NewOrder,
		secondary: true
	},
	{
		name: 'Actualizar Perdido',
		layout: '/order',
		path: '/edit/:id',
		component: EditOrder,
		secondary: true
	},
	{
		name: 'Nueva Orden de Compra',
		layout: '/purchase-order',
		path: '/new/:id',
		component: NewPurchaseOrder,
		secondary: true
	},
	{
		name: 'Actualizar Orden de Compra',
		layout: '/purchase-order',
		path: '/edit/:id',
		component: EditPurchaseOrder,
		secondary: true
	},
	{
		name: 'Nueva Factura',
		layout: '/invoice',
		path: '/new/:id',
		component: NewInvoice,
		secondary: true
	},
	{
		name: 'Nuevo Recibo',
		layout: '/receipt',
		path: '/new/:id',
		component: NewReceipt,
		secondary: true
	},
	{
		name: 'Gastos',
		layout: '/expense',
		path: '/index/:id',
		component: Expenses,
		secondary: true
	},
	{
		name: 'Nueva Planilla',
		layout: '/pay-roll',
		path: '/new/:id',
		component: NewPayRoll,
		secondary: true
	},
	{
		name: 'Nueva Solicitud de Material',
		layout: '/material-request',
		path: '/new/:id',
		component: NewMaterialRequest,
		secondary: true
	},
	{
		name: 'Nuevo Reembolso',
		layout: '/reimbursement',
		path: '/new/:id',
		component: NewReimbursement,
		secondary: true
	},
	{
		name: 'Nuevo Servicio',
		layout: '/service',
		path: '/new/:id',
		component: NewService,
		secondary: true
	},
	{
		name: "Dashboard",
		layout: "/dashboard",
		path: "/index",
		icon: <Icon as={MdBarChart} width='20px' height='20px' color='inherit' />,
		component: Dashboard,
	},
	{
		name: 'Salir',
		layout: '/auth',
		path: '/sign-in',
		icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
		component: SignInCentered
	},
	{
		name: 'Sign Up',
		layout: '/auth',
		path: '/sign-up',
		icon: null,
		component: SignUpCentered
	}
];

export default routes;
