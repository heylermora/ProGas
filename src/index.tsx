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
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
	<ChakraProvider theme={theme}>
		<OrderRefreshProvider>
			<React.StrictMode>
				<AuthProvider>   
					<HashRouter>
						<Switch>
							<Route path={`/auth`} component={AuthLayout} />
							<PrivateRoute path={`/admin/order`} component={AdminLayout} />
							<Redirect from='/' to='/auth' />
						</Switch>
					</HashRouter>
				</AuthProvider>
			</React.StrictMode>
		</OrderRefreshProvider>
	</ChakraProvider>,
	document.getElementById('root')
);