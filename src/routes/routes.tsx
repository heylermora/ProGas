import { Icon } from '@chakra-ui/react';
import { MdHome, MdAssessment, MdInventory, MdCampaign } from 'react-icons/md';

// Order Imports
import Orders from 'views/admin/order';
import DetailsOrder from 'views/admin/order/details';
import NewAdminOrder from 'views/admin/order/new';
import NewCustomerOrder from 'views/customer/order/new';
import EditOrder from 'views/admin/order/edit';
import Balance from 'views/admin/order/balance';

// Sponsor Imports
import SponsorsAdmin from 'views/admin/sponsor';
import SponsorForm from 'views/admin/sponsor/form';

// Product Imports
import Product from 'views/admin/product';
import NewProduct from 'views/admin/product/new';
import EditProduct from 'views/admin/product/edit';

// Dashboard Imports
import Dashboard from 'views/admin/dashboard';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';

// Public Imports
import Home from 'views/public/Home';
import CustomerData from 'views/public/CustomerData';
import CustomerInfo from 'views/public/CustomerInfo';
import PublicProducts from 'views/public/Products';
import ViewOrder from 'views/public/ViewOrder';
import SponsorshipPackages from 'views/public/SponsorshipPackages';

const routes: RoutesType[] = [
  {
    name: 'Inicio',
    layout: '',
    path: '/',
    component: Home,
    secondary: true,
  },
  {
    name: 'Datos del cliente',
    layout: '/customer',
    path: '/data',
    component: CustomerData,
    secondary: true,
  },
  {
    name: 'Información del cliente',
    layout: '/customer',
    path: '/info',
    component: CustomerInfo,
    secondary: true,
  },
  {
    name: 'Productos',
    layout: '/customer',
    path: '/products',
    component: PublicProducts,
    secondary: true,
  },
  {
    name: 'Ver pedido',
    layout: '/customer',
    path: '/view-order',
    component: ViewOrder,
    secondary: true,
  },


  {
    name: 'Paquetes de patrocinadores',
    layout: '/sponsors',
    path: '/packages',
    component: SponsorshipPackages,
    secondary: true,
  },

  {
    name: 'Pedidos',
    layout: '/admin',
    path: '/order/index/:search?',
    icon: <Icon as={MdHome} width="20px" height="20px" />,
    component: Orders,
  },
  {
    name: 'Detalles del Pedido',
    layout: '/admin',
    path: '/order/details/:id',
    component: DetailsOrder,
    secondary: true,
  },
  {
    name: 'Nuevo Pedido',
    layout: '/admin',
    path: '/order/new',
    component: NewAdminOrder,
    secondary: true,
  },
  {
    name: 'Actualizar Pedido',
    layout: '/admin',
    path: '/order/edit/:id',
    component: EditOrder,
    secondary: true,
  },
  {
    name: 'Operaciones',
    layout: '/admin',
    path: '/order/balance',
    icon: <Icon as={MdAssessment} width="20px" height="20px" />,
    component: Balance,
  },

  {
    name: 'Patrocinadores',
    layout: '/admin',
    path: '/sponsor/index',
    icon: <Icon as={MdCampaign} width="20px" height="20px" />,
    component: SponsorsAdmin,
    roles: ['admin'],
  },
  {
    name: 'Nuevo Patrocinador',
    layout: '/admin',
    path: '/sponsor/new',
    component: SponsorForm,
    secondary: true,
    roles: ['admin'],
  },
  {
    name: 'Editar Patrocinador',
    layout: '/admin',
    path: '/sponsor/edit/:id',
    component: SponsorForm,
    secondary: true,
    roles: ['admin'],
  },
  // PRODUCTS
  {
    name: 'Productos',
    layout: '/admin',
    path: '/product/index/:search?',
    icon: <Icon as={MdInventory} width="20px" height="20px" />,
    component: Product,
  },
  {
    name: 'Nuevo Producto',
    layout: '/admin',
    path: '/product/new',
    component: NewProduct,
    secondary: true,
  },
  {
    name: 'Editar Producto',
    layout: '/admin',
    path: '/product/edit/:id',
    component: EditProduct,
    secondary: true,
  },
  {
    name: 'Nuevo Pedido',
    layout: '/customer',
    path: '/order/new',
    component: NewCustomerOrder,
    secondary: true,
  },
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard/index',
    component: Dashboard,
    secondary: true,
  },
  {
    name: 'Salir',
    layout: '/auth',
    path: '/sign-in',
    component: SignInCentered,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    component: SignUpCentered,
  },
];

export default routes;
