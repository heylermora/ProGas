import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import ProjectLayout from './layouts/admin';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';

ReactDOM.render(
	<ChakraProvider theme={theme}>
		<React.StrictMode>
			<HashRouter>
				<Switch>
					<Route path={`/auth`} component={AuthLayout} />
					<Route path={`/order`} component={ProjectLayout} />
					<Route path={`/change-order`} component={ProjectLayout} />
					<Route path={`/purchase-order`} component={ProjectLayout} />
					<Route path={`/invoice`} component={ProjectLayout} />
					<Route path={`/receipt`} component={ProjectLayout} />
					<Route path={`/expense`} component={ProjectLayout} />
					<Route path={`/pay-roll`} component={ProjectLayout} />
					<Route path={`/material-request`} component={ProjectLayout} />
					<Route path={`/reimbursement`} component={ProjectLayout} />
					<Route path={`/service`} component={ProjectLayout} />
					<Route path={`/dashboard`} component={ProjectLayout} />
					<Redirect from='/' to='/auth' />
				</Switch>
			</HashRouter>
		</React.StrictMode>
	</ChakraProvider>,
	document.getElementById('root')
);