import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'assets/css/MiniCalendar.css';
import { Text, Icon } from '@chakra-ui/react';
// Chakra imports
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
// Custom components
import Card from 'components/card/Card';

export default function MiniCalendar(props: { selectRange: boolean; [x: string]: any }) {
	const { selectRange, ...rest } = props;
	const [date, setDate] = useState([
		new Date(new Date().getFullYear(), 0, 1),
		new Date(new Date().getFullYear(), 11, 31),
	]);
	return (
		<Card
			alignItems='center'
			flexDirection='column'
			w='100%'
			maxW='max-content'
			p='20px 15px'
			h='max-content'
			{...rest}>
			<Calendar
				onChange={setDate}
				defaultValue={date}
				selectRange={selectRange}
				tileContent={<Text color='brand.500' />}
				prevLabel={<Icon as={MdChevronLeft} w='24px' h='24px' mt='4px' />}
				nextLabel={<Icon as={MdChevronRight} w='24px' h='24px' mt='4px' />}
			/>
		</Card>
	);
}
