// Chakra Imports
import {
	Flex,
	useColorModeValue,
	type ResponsiveValue,
	Button,
	Icon
} from '@chakra-ui/react';
import { MdLogout } from 'react-icons/md';

// Custom Components
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
// Assets
import routes from 'routes/routes';

import { useHistory } from "react-router-dom";
import { logout } from 'services/AuthService';

export default function HeaderLinks(props: { secondary: boolean; fixed?: boolean; onOpen?: (...args: any[]) => any }) {
	const { secondary } = props;

	const history = useHistory();

	const handleLogout = async () => {
		await logout();
		history.push("/auth/sign-in"); 
	};
	// Chakra Color Mode
	let menuBg = useColorModeValue('white', 'navy.800');
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);
	return (
		<Flex
			w={{ base: '100%', md: 'auto' }}
			alignItems='center'
			flexDirection='row'
			gap={{ base: '6px', md: '0' }}
			bg={menuBg}
			flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
			p={{ base: '6px', sm: '10px' }}
			borderRadius='30px'
			boxShadow={shadow}>
			<SearchBar
				flex='1'
				minW='0'
				mb={() => {
					if (secondary) {
						const msPrimary: ResponsiveValue<string> = { base: '10px', md: 'unset' };
					return msPrimary;
					}
					return 'unset';
				}}
				me='10px'
				borderRadius='30px'
			/>
			<SidebarResponsive routes={routes} />
			<Button
				onClick={handleLogout}
				variant="ghost"
				leftIcon={<Icon as={MdLogout} boxSize={4} />}
				color="red.500"
				fontWeight="600"
				borderRadius="24px"
				px={{ base: '10px', sm: '16px' }}
				fontSize={{ base: 'sm', md: 'md' }}
				_hover={{ bg: "red.100" }}
			>
				Salir
			</Button>
		</Flex>
	);
}

HeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};
