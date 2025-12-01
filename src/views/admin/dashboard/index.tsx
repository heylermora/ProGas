//React imports
import { useState, useEffect } from 'react'; 

// Chakra imports
import { Avatar, Box, FormLabel, Icon, SimpleGrid, useColorModeValue, Select, Grid, GridItem } from '@chakra-ui/react';
// Assets
import { MdStars, MdFileCopy, MdTexture } from 'react-icons/md';
import usd from 'assets/img/dashboards/usd.png';
import crc from 'assets/img/dashboards/crc.png';
// Utils
import { formatValue } from 'utils/formatValue';
import { monthOrder } from 'utils/monthOrder';
// import { convertValue } from 'utils/convertValue';

// Custom components
// import MiniCalendar from 'components/calendar/MiniCalendar';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import Error from 'components/exceptions/Error';
import DashboardItem from 'interfaces/DashboardItem';
import DashboardService from 'services/DashboardService';

import CheckList from 'views/admin/dashboard/components/CheckList';
import BarChartCard from 'views/admin/dashboard/components/BarChartCard';
import PieCard from 'views/admin/dashboard/components/PieCard';
import LineCard from 'views/admin/dashboard/components/LineCard';

export default function Index() {
	// Chakra Color Mode
	const brandColor = useColorModeValue('brand.500', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

	const [selectedCurrency, setSelectedCurrency] = useState('usd');
	const [cant, setCant] = useState('0');
	const [squareMeters, setSquareMeters] = useState('0');

	const [budgetUSD, setBudgetUSD] = useState('0');
	const [purchaseOrderUSD, setPurchaseOrderUSD] = useState('0');
	const [purchaseOrderCOL, setPurchaseOrderCOL] = useState('0');
	const [expenseUSD, setExpenseUSD] = useState('0');
	const [budgetCOL, setBudgetCOL] = useState('0');
	const [expenseCOL, setExpenseCOL] = useState('0');

	const [projectsList, setProjectsList] = useState([]);
	let [checkedProjectsList, setCheckedProjectsList] = useState([]);
	const [clientsList, setClientsList] = useState([]);
	let [checkedClientsList, setCheckedClientsList] = useState([]);
	const [invoiceList, setInvoiceList] = useState([]);
	const [expenseList, setExpenseList] = useState([]);

	// const [totalInvoiceList, setTotalInvoiceList] = useState([]);
	// const [totalExpenseList, setTotalExpenseList] = useState([]);

	const [typesList, setTypesList] = useState([]);
	const [isError, setIsError] = useState(false);

	useEffect(() => {
		let promise = DashboardService.getAll();
		promise
			.then(async (projectsData: DashboardItem[]) => {
				let squareMetersTotal = 0;
				let budgetTotalUSD = 0;
				let purchaseOrderTotalUSD = 0;
				let purchaseOrderTotalCOL = 0;
				let expenseTotalUSD = 0;
				let budgetTotalCOL = 0;
				let expenseTotalCOL = 0;
				let projectItems = [];
				let clientItems = [];
				let invoiceItems = [];
				let expenseItems = [];

				const typeCounts:  { [type: string]: number }  = {};
				for (const project of projectsData) {
					squareMetersTotal += project.squareMeters;
					budgetTotalCOL += project.budgetCOL;
					budgetTotalUSD += project.budgetUSD;
					purchaseOrderTotalUSD += project.purchaseOrderAmountUSD;
					purchaseOrderTotalCOL += project.purchaseOrderAmountCOL;
					expenseTotalUSD += project.expenseAmountUSD;
					expenseTotalCOL += project.expenseAmountCOL;
					projectItems.push({
						label: project.name,
						invoiceAmountUSD: project.invoiceAmountUSD,
						invoiceAmountCOL: project.invoiceAmountCOL,
						expenseAmountUSD: project.expenseAmountUSD,
						expenseAmountCOL: project.expenseAmountCOL
					});

					clientItems.push({
						label: project.client,
						invoiceAmountUSD: project.invoiceAmountUSD,
						invoiceAmountCOL: project.invoiceAmountCOL,
						expenseAmountUSD: project.expenseAmountUSD,
						expenseAmountCOL: project.expenseAmountCOL
					});

					invoiceItems.push({
						client: project.client,
						project: project.name,
						list: project.invoiceList
					});

					expenseItems.push({
						client: project.client,
						project: project.name,
						list: project.expenseList
					});
        			typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
				}
				const typeListWithCounts = Object.keys(typeCounts).map((type) => ({
					type: type,
					count: typeCounts[type],
				}));
			
				setTypesList(typeListWithCounts);
				setCant(formatValue(projectsData.length.toString()));
				setSquareMeters(formatValue(squareMetersTotal.toString()));
				setBudgetUSD(formatValue(budgetTotalUSD.toString()));
				setPurchaseOrderUSD(formatValue(purchaseOrderTotalUSD.toString()));
				setExpenseUSD(formatValue(expenseTotalUSD.toString()));
				setBudgetCOL(formatValue(budgetTotalCOL.toString()));
				setPurchaseOrderCOL(formatValue(purchaseOrderTotalCOL.toString()));
				setExpenseCOL(formatValue(expenseTotalCOL.toString()));

				setClientsList([...clientItems]);
				setCheckedClientsList([...clientItems]);

				setProjectsList([...projectItems]);
				setCheckedProjectsList([...projectItems]);

				setInvoiceList([...invoiceItems]);
				setExpenseList([...expenseItems]);
			})
			.catch((error) => {
				console.error('Error fetching projects:', error);
				setIsError(true);
			});
	}, []);

	function sumByMonth(data: any[]): any[] {
		const monthTotals: { [key: string]: any } = {};
		for (const item of data) {
		  for (const monthData of item) {
			const { month, amountCOL, amountUSD } = monthData;
			if (!monthTotals[month]) monthTotals[month] = { month, amountCOL: 0, amountUSD: 0 };
			monthTotals[month].amountCOL += amountCOL;
			monthTotals[month].amountUSD += amountUSD;
		  }
		} 
		const sortedResult = Object.values(monthTotals).sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);

		let accumulatedAmountCOL = 0;
		let accumulatedAmountUSD = 0;
	  
		for (const monthData of sortedResult) {
		  monthData.amountCOL += accumulatedAmountCOL;
		  monthData.amountUSD += accumulatedAmountUSD;
		  accumulatedAmountCOL = monthData.amountCOL;
		  accumulatedAmountUSD = monthData.amountUSD;
		}
		return sortedResult;
	}

	return (
		isError ? (
        	<Error />
      	) : (
			<Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
				<SimpleGrid columns={{ base: 1, md: 2, lg: 3, '2xl': 6 }} gap='20px' mb='20px'>
					<MiniStatistics
						startContent={
							<FormLabel htmlFor='balance'>
								<Avatar src={selectedCurrency === 'usd' ? usd : crc} />
							</FormLabel>
						}
						endContent={
							<Select
								id='balance'
								mt='5px'
								me='0px'
								defaultValue={selectedCurrency}
								onChange={(e) => setSelectedCurrency(e.target.value)}
							>
								<option value='usd'>USD</option>
								<option value='crc'>CRC</option>
							</Select>
						}
						name='Moneda'
						value={selectedCurrency === 'usd' ? 'Dólar' : 'Colón'}
					/>
					<MiniStatistics
						startContent={
							<IconBox
								w='56px'
								h='56px'
								bg={boxBg}
								icon={<Icon w='32px' h='32px' as={MdFileCopy} color={brandColor} />}
							/>
						}
						name='Proyectos'
						value={cant}
					/>
					<MiniStatistics
						startContent={
							<IconBox
								w='56px'
								h='56px'
								bg={boxBg}
								icon={<Icon w='32px' h='32px' as={MdTexture} color={brandColor} />}
							/>
						}
						name='Metros Cuadrados'
						value={`${squareMeters} m²`}
					/>
					<MiniStatistics
						startContent={
							<IconBox
								w='56px'
								h='56px'
								bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
								icon={<Icon w='32px' h='32px' as={MdStars} color={'white'} />}
							/>
						}
						name='Presupuesto Total'
						value={(selectedCurrency === 'usd' ? `$ ${budgetUSD}` : `₡ ${budgetCOL}`)}
					/>
					<MiniStatistics
						startContent={
							<IconBox
								w='56px'
								h='56px'
								bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
								icon={<Icon w='32px' h='32px' as={MdStars} color={'white'} />}
							/>
						}
						name='Ingreso Total'
						value={(selectedCurrency === 'usd' ? `$ ${purchaseOrderUSD}` : `₡ ${purchaseOrderCOL}`)}
					/>
					<MiniStatistics
						startContent={
							<IconBox
								w='56px'
								h='56px'
								bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
								icon={<Icon w='32px' h='32px' as={MdStars} color={'white'} />}
							/>
						}
						name='Gasto Total'
						value={(selectedCurrency === 'usd' ? `$ ${expenseUSD}` : `₡ ${expenseCOL}`)}
					/>
				</SimpleGrid>
				<Grid
					h="200px"
					templateRows="repeat(2, 1fr)"
					templateColumns="repeat(4, 1fr)"
					mb='20px'
					gap='20px'
				>
					<GridItem  rowSpan={2} colSpan={1}>
						<CheckList title='Clientes' items={clientsList} checkedItems={checkedClientsList} onCheckedItemsChange={setCheckedClientsList}/>
					</GridItem>
					<GridItem  colSpan={3}>
					{checkedClientsList?.length === 1 ? 
						(
							<LineCard
								title='Facturación'
								subtitle={checkedClientsList[0]?.label}
								entities={[checkedClientsList[0]?.label]}
								labels={invoiceList.find(i => i.client === checkedClientsList[0]?.label)?.list.map((l?: { month: string }) => l?.month)}
								values={invoiceList.find(i => i.client === checkedClientsList[0]?.label)?.list.map((l?: { amountUSD: number }) => l?.amountUSD)}
							/>
						):(
							<BarChartCard 
								title='Facturación'
								entity='Clientes'
								labels={clientsList.map(c => c.label).filter(label => checkedClientsList.map(c => c.label).includes(label))}
								values={(selectedCurrency === 'usd' ? checkedClientsList.map(c => c.invoiceAmountUSD) : checkedClientsList.map(c => c.invoiceAmountCOL))}
							/>
						)
					}
					</GridItem>
					<GridItem  colSpan={3}>
					{checkedClientsList.length === 1 ? 
						(
							<LineCard
								title='Gastos'
								subtitle={checkedClientsList[0]?.label}
								entities={[checkedClientsList[0]?.label]}
								labels={expenseList.find(i => i.client === checkedClientsList[0]?.label)?.list?.map((l?: { month: string }) => l?.month)}
								values={expenseList.find(i => i.client === checkedClientsList[0]?.label)?.list?.map((l?: { amountUSD: number }) => l?.amountUSD)}
							/>
						):(
							<BarChartCard 
								title='Gastos'
								entity='Clientes'
								labels={clientsList.map(c => c.label).filter(label => checkedClientsList.map(c => c.label).includes(label))}
								values={(selectedCurrency === 'usd' ? checkedClientsList.map(c => c.expenseAmountUSD) : checkedClientsList.map(c => c.expenseAmountUSD))}
							/>
						)
					}
					</GridItem>
					<GridItem  rowSpan={2} colSpan={1}>
						<CheckList title='Proyectos' items={projectsList} checkedItems={checkedProjectsList} onCheckedItemsChange={setCheckedProjectsList} />
					</GridItem>
					<GridItem  colSpan={3}>
						{checkedProjectsList.length === 1 ? 
						(
							<LineCard
								title='Facturación'
								subtitle={checkedProjectsList[0]?.label}
								entities={[checkedProjectsList[0]?.label]}
								labels={invoiceList.find(i => i.project === checkedProjectsList[0]?.label)?.list.map((l?: { month: string }) => l?.month)}
								values={invoiceList.find(i => i.project === checkedProjectsList[0]?.label)?.list.map((l?: { amountUSD: number }) => l?.amountUSD)}
							/>
						):(
							<BarChartCard
								title='Facturación'
								entity='Proyectos'
								labels={projectsList.map(c => c.label).filter(label => checkedProjectsList.map(c => c.label).includes(label))}
								values={(selectedCurrency === 'usd' ? checkedProjectsList.map(c => c.invoiceAmountUSD) : checkedProjectsList.map(c => c.invoiceAmountCOL))}
							/>
						)
						}
					</GridItem>
					<GridItem  colSpan={3}>
						{checkedProjectsList.length === 1 ? 
						(
							<LineCard
								title='Gastos'
								subtitle={checkedProjectsList[0]?.label}
								entities={[checkedProjectsList[0]?.label]}
								labels={expenseList.find(i => i.project === checkedProjectsList[0]?.label)?.list?.map((l?: { month: string }) => l?.month)}
								values={expenseList.find(i => i.project === checkedProjectsList[0]?.label)?.list?.map((l?: { amountUSD: number }) => l?.amountUSD)}
							/>
						):(
							<BarChartCard
								title='Gastos'
								entity='Proyectos'
								labels={projectsList.map(c => c.label).filter(label => checkedProjectsList.map(c => c.label).includes(label))}
								values={(selectedCurrency === 'usd' ? checkedProjectsList.map(c => c.expenseAmountUSD) : checkedProjectsList.map(c => c.expenseAmountCOL))}
							/>
						)
						}
					</GridItem>
					<GridItem  colSpan={3}>
						<LineCard 
							title='Resumen'
							subtitle='Financiero'
							entities={['Presupuesto', 'Ingresos', 'Gastos']}
							labels={sumByMonth(invoiceList.map(i => i.list)).map(m => m.month)}
							values={(selectedCurrency === 'usd' ? 
									[sumByMonth(invoiceList?.map(i => i?.list))?.map(m => m?.amountUSD), sumByMonth(expenseList?.map(i => i?.list))?.map(m => m?.amountUSD)] : 
									[sumByMonth(invoiceList?.map(i => i?.list))?.map(m => m?.amountCOL), sumByMonth(expenseList?.map(i => i?.list))?.map(m => m?.amountCOL)]
							)}
							budget={(selectedCurrency === 'usd' ?  parseFloat(budgetUSD.replace(',','')) :  parseFloat(budgetCOL.replace(',','')))}
						/>
					</GridItem>
					<GridItem colSpan={1}>
						<PieCard title='Tipo de Proyecto' labels={typesList.map(l => l.type)} values={typesList.map(l => l.count)} />
					</GridItem>
				</Grid>
			</Box>
		)
	);
}