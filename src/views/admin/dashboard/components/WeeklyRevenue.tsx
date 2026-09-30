// Chakra imports
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
// Custom components
import BarChart from 'components/charts/BarChart';
import React from 'react';
import { barChartDataConsumption, barChartOptionsConsumption } from 'variables/charts';

export default function WeeklyRevenue(props: { [x: string]: any }) {
	const { ...rest } = props;

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	return (
		<Card alignItems='center' flexDirection='column' w='100%' {...rest}>
			<Flex align='center' w='100%' px='15px' py='10px'>
				<Text me='auto' color={textColor} fontSize='xl' fontWeight='700' lineHeight='100%'>
					Weekly Revenue
				</Text>
			</Flex>
			<Box h='240px' mt='auto' w='100%'>
				<BarChart chartData={barChartDataConsumption} chartOptions={barChartOptionsConsumption} />
			</Box>
		</Card>
	);
}
