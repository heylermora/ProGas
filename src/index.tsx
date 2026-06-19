import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import { OrderRefreshProvider } from './contexts/OrderRefreshContext';
import PrivateRoute from './routes/PrivateRoute';
import Home from './views/public/Home';
import CustomerData from './views/public/CustomerData';
import CustomerInfo from './views/public/CustomerInfo';
import PublicProducts from './views/public/Products';
import ViewOrder from './views/public/ViewOrder';
import SponsorshipPackages from './views/public/SponsorshipPackages';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
	<ChakraProvider theme={theme}>
		<OrderRefreshProvider>
			<React.StrictMode>
				<AuthProvider>   
					<HashRouter>
						<Switch>
							<Route exact path={`/`} component={Home} />
							<Route path={`/customer/data`} component={CustomerData} />
							<Route path={`/customer/info`} component={CustomerInfo} />
							<Route path={`/customer/products`} component={PublicProducts} />
							<Route path={`/customer/view-order`} component={ViewOrder} />
							<Route path={`/sponsors/packages`} component={SponsorshipPackages} />
							<Route path={`/auth`} component={AuthLayout} />
							<PrivateRoute path={`/admin/order`} component={AdminLayout} />
							<PrivateRoute path={`/admin/product`} component={AdminLayout} />
							<PrivateRoute path={`/admin/sponsor`} component={AdminLayout} />
							<Route path={`/customer/order`} component={AdminLayout} />
							<Redirect to='/' />
						</Switch>
					</HashRouter>
				</AuthProvider>
			</React.StrictMode>
		</OrderRefreshProvider>
	</ChakraProvider>,
	document.getElementById('root')
);