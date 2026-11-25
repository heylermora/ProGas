// Chakra imports
import { Image, Flex, useColorModeValue } from '@chakra-ui/react';

// Custom components
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
	const logo = useColorModeValue('logo', 'logo-blanco');
	return (
		<Flex alignItems='center' flexDirection='column'>
			<Image src={`${process.env.PUBLIC_URL}/ula/${logo}.png`} alt="Ulà" h="76px" w="auto" my="12px" />
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
