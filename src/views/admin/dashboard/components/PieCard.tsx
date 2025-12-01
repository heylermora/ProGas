// Chakra imports
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import PieChart from 'components/charts/PieChart';
import { pieChartOptions } from 'variables/charts';
import { VSeparator } from 'components/separator/Separator';
export default function Conversion(props: { title: string,  labels: string[], values: number[], [x: string]: any }) {
	const { title, labels, values, ...rest } = props;

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const cardColor = useColorModeValue('white', 'navy.700');
	const cardShadow = useColorModeValue('0px 18px 40px rgba(112, 144, 176, 0.12)', 'unset');
	const totalValues = values.reduce((acc, value) => acc + value, 0);

	const separators = (
		<VSeparator mx={{ base: '10px', xl: '10px', '2xl': '10px' }} />
	);

	const chartDataElements = values.map((value, index) => {
		const percentage = ((value / totalValues) * 100).toFixed(0);
		const isLastElement = index === values.length - 1;

		return (
			<>
				<Flex direction='column' py='5px' key={index}>
					<Flex align='center'>
						<Box h='8px' w='8px' bg={pieChartOptions('').colors[index]} borderRadius='100%' mb='auto' mt='4px' me='4px' />
						<Text fontSize='xs' color='secondaryGray.600' fontWeight='700' mb='5px'>
							{labels[index]}
						</Text>
					</Flex>
					<Text fontSize='lg' color={textColor} fontWeight='700'>
						{percentage}%
					</Text>
				</Flex>
				{!isLastElement && separators}
			</>
		)
	});



	return (
		<Card p='20px' alignItems='center' flexDirection='column' w='100%' {...rest}>
			<Flex
				px={{ base: '0px', '2xl': '10px' }}
				justifyContent='space-between'
				alignItems='center'
				w='100%'
				mb='8px'>
				<Text color={textColor} fontSize='md' fontWeight='600' mt='4px'>
					{title}
				</Text>
			</Flex>

			<PieChart h='100%' w='100%' chartData={values} chartOptions={pieChartOptions(labels)} />
			<Card
				bg={cardColor}
				flexDirection='row'
				boxShadow={cardShadow}
				w='100%'
				p='15px'
				px='20px'
				mt='15px'
				mx='auto'>
				{chartDataElements}
			</Card>
		</Card>
	);
}
