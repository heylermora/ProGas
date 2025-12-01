// React imports
import React, { useState, useEffect } from 'react';

// Chakra imports
import { Box, Flex, Text, useColorModeValue, /*Spinner, Center*/ } from '@chakra-ui/react';
import BarChart from 'components/charts/BarChart';

// Custom components
import Card from 'components/card/Card';
import { barChartData, barChartOptions } from 'variables/charts';

// import Empty from 'components/exceptions/Empty';

export default function BarChartCard(props: { title: string, entity: string, labels: string[], values: number[], [x: string]: any }) {
	const { title, entity, labels, values, ...rest } = props;

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	// const spinnerColor = useColorModeValue('brand.700', 'white');

	const [isError, setIsError] = useState(true);

	useEffect(() => {
		setIsError(labels.length === 0);
	}, [labels]);
			
	return (
		<Card alignItems='center' flexDirection='column' w='100%' {...rest}>
			<Flex justify='space-between' align='start' px='10px' pt='5px' w='100%'>
				<Flex flexDirection='column' align='start' me='20px'>
					<Flex w='100%'>
						<Text me='auto' color='secondaryGray.600' fontSize='sm' fontWeight='500'>
							{title}
						</Text>
					</Flex>
					<Flex align='end'>
						<Text color={textColor} fontSize='34px' fontWeight='700' lineHeight='100%'>
							{labels.length}
						</Text>
						<Text ms='6px' color='secondaryGray.600' fontSize='sm' fontWeight='500'>
							{entity}
						</Text>
					</Flex>
				</Flex>
			</Flex>
			<Box h='240px' w='100%' mt='auto'>
			{isError ? (
				<Text
					color="#A3AED0"
					fontSize="24px"
					fontWeight="500"									
            	>
                	¡Sin datos disponibles!
            	</Text> 
			) : (
				<BarChart chartData={barChartData(title, values)} chartOptions={barChartOptions(labels)} />
			)}
			</Box>
		</Card>
	);
}
