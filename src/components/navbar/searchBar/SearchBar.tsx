import React from 'react';

import { Input, InputGroup, InputLeftElement, useColorModeValue } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import IconBox from 'components/icons/IconBox';
import { usePageSearch } from 'contexts/PageSearchContext';


export function SearchBar(props: {
	variant?: string;
	background?: string;
	children?: JSX.Element;
	placeholder?: string;
	borderRadius?: string | number;
	[x: string]: any;
}) {
	// Pass the computed styles into the `__css` prop
	const { variant, background, children, placeholder, borderRadius, ...rest } = props;
	// Chakra Color Mode
	const searchIconColor = useColorModeValue('gray.700', 'white');
	const inputBg = useColorModeValue('secondaryGray.300', 'navy.900');
	const inputText = useColorModeValue('gray.700', 'gray.100');
	const { query, setQuery, enabled, placeholder: pagePlaceholder } = usePageSearch();

	return (
		<InputGroup w={{ base: '100%', md: '300px', lg: '360px' }} maxW="100%" {...rest}>
			<InputLeftElement
				children={
					<IconBox
						mx='auto'
						h='100px'
						w='100px'
						icon={<SearchIcon color={searchIconColor} w='15px' h='15px' />}
						bg='inherit'
					/>
				}
			/>
			<Input
				aria-label={pagePlaceholder}
				variant='search'
				fontSize='sm'
				bg={background ? background : inputBg}
				color={inputText}
				fontWeight='500'
				_placeholder={{ color: 'gray.400', fontSize: '14px' }}
				borderRadius={borderRadius ? borderRadius : '30px'}
				placeholder={placeholder || pagePlaceholder}
				value={query}
				disabled={!enabled}
				onChange={(event) => setQuery(event.target.value)}
			/>
		</InputGroup>
	);
}
