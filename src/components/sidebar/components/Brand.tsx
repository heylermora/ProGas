// Chakra imports
import { Text, Flex } from '@chakra-ui/react';

// Custom components
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
	return (
		<Flex alignItems='center' flexDirection='column'>
			<Text fontSize="5xl">PRO<b>GAS</b></Text> 
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
