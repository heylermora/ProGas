import AppVersion from 'components/dataDisplay/AppVersion';
// chakra imports
import { Box, Flex, Stack, useColorModeValue } from '@chakra-ui/react';
//   Custom components
import Brand from 'components/sidebar/components/Brand';
import Links from 'components/sidebar/components/Links';

// FUNCTIONS

function SidebarContent(props: { routes: RoutesType[] }) {
	const { routes } = props;
	const versionColor = useColorModeValue('gray.600', 'gray.300');
	const versionBorder = useColorModeValue('gray.100', 'whiteAlpha.200');
	// SIDEBAR
	return (
		<Flex direction='column' height='100%' pt='25px' borderRadius='30px'>
			<Brand />
			<Stack direction='column' mt='8px' mb='auto'>
				<Box ps='20px' pe={{ lg: '16px', '2xl': '16px' }}>
					<Links routes={routes} />
				</Box>
			</Stack>
			<AppVersion px='24px' py='16px' color={versionColor} borderTop='1px solid' borderColor={versionBorder} />
		</Flex>
	);
}

export default SidebarContent;
