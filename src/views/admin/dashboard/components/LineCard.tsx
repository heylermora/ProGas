//React imports
import { useState, useEffect } from 'react'; 
// Chakra imports
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import LineChart from 'components/charts/LineChart';

// Assets
import { lineChartData, lineChartOptions } from 'variables/charts';

export default function LineCard(props: { title: string, subtitle: string, entities: string[], labels: string[], values: number[][], budget?: number, [x: string]: any }) {
	const { title, subtitle, entities, labels, values, budget, ...rest } = props;

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');

	const [dataList, setDataList] = useState([]);

	useEffect(() => {
		let list: { name: string; data: any }[] = [];
		const maxLength = values ? Math.max(...values.map(sublist => sublist ? sublist.length : 0)) : 0;

		entities.forEach(e => {
			let data: number[] = [];
			
			if (e === 'Presupuesto') {
				data = Array(maxLength).fill(budget);
				list.push({ name: e, data: data });
			} else if (e === 'Ingresos') {
				data = values[0];
				while (data.length < maxLength) {
				  data.push(0);
				}
				list.push({ name: e, data: data })
			} else if (e === 'Gastos') {
				data = values[1];
				while (data.length < maxLength) {
				  data.push(0);
				}
				list.push({ name: e, data: data })
			} else {
			  	list.push({ name: e, data: values });
			}
		  });
		setDataList(list);
	}, [entities, values, budget]);

	return (
		<Card justifyContent='center' alignItems='center' flexDirection='column' w='100%' h='100%' mb='0px' {...rest}>
			<Flex w='100%' flexDirection={{ base: 'column', lg: 'row' }}>
				<Flex flexDirection='column' me='20px' mt='28px'>
					<Text isTruncated color={textColor} fontSize='24px' textAlign='start' fontWeight='700' lineHeight='100%'>
						{title}
					</Text>
					<Flex align='center' mb='20px'>
						<Text color='secondaryGray.600' fontSize='sm' fontWeight='500' mt='4px' me='12px'>
							{subtitle}
						</Text>
					</Flex>
				</Flex>
				<Box minH='260px' minW='75%' mt='auto'>
					<LineChart chartData={lineChartData(dataList)} chartOptions={lineChartOptions(labels)} />
				</Box>
			</Flex>
		</Card>
	);
}
