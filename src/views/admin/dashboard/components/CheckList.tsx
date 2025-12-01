// React imports
import React, { useState, useEffect, useCallback } from 'react';
// Chakra imports
import { Box, Flex, Text, Circle, useColorModeValue, Checkbox, IconButton } from '@chakra-ui/react';
// Custom components
import Card from 'components/card/Card';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import Empty from 'components/exceptions/Empty';

export default function CheckList(props: {
    title: string, 
    items: {label: string, invoiceAmountUSD: number, invoiceAmountCOL: number, expenseAmountUSD: number, expenseAmountCOL: number}[], 
    checkedItems: {name: string, invoiceAmountUSD: number, invoiceAmountCOL: number, expenseAmountUSD: number, expenseAmountCOL: number}[],
    onCheckedItemsChange: any,
    [x: string]: any }) {
	const { title, items, checkedItems, onCheckedItemsChange, ...rest } = props;

	// Chakra Color Mode
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const boxBg = useColorModeValue('secondaryGray.300', 'navy.700');

    const [isChecked, setIsChecked] = useState(true);
    const [isIndeterminate, setIsIndeterminate] = useState(false);
    const [checkboxes, setCheckboxes] = useState([]);
    const itemsPerPage = 13;
    const [currentPage, setCurrentPage] = useState(1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        const initialCheckboxes: { label: string; invoiceAmountUSD: number, invoiceAmountCOL: number, expenseAmountUSD: number, expenseAmountCOL: number, checked: boolean }[] = [];

        items.forEach(item => {
            initialCheckboxes.push({
              label: item.label,
              invoiceAmountCOL: item.invoiceAmountCOL,
              invoiceAmountUSD: item.invoiceAmountUSD,
              expenseAmountCOL: item.expenseAmountCOL,
              expenseAmountUSD: item.expenseAmountUSD,
              checked: true
            });
        });

        setCheckboxes(initialCheckboxes);
    }, [items]);

    const handleCheckAll = useCallback(
        () => {
        setIsIndeterminate(false);
        setIsChecked(!isChecked);
        const newCheckboxes = checkboxes.map((checkbox: any) => ({
        ...checkbox,
        checked: !isChecked,
        }));
        setCheckboxes(newCheckboxes);

        const newCheckedItems = newCheckboxes
        .filter((item) => item.checked);




        onCheckedItemsChange(newCheckedItems);
        }, [checkboxes, isChecked, onCheckedItemsChange]);

    const handleCheckboxChange = useCallback(
        (index: number) => {
            index = startIndex + index;
            const newCheckboxes = [...checkboxes];
            newCheckboxes[index].checked = !newCheckboxes[index].checked;
            setCheckboxes(newCheckboxes);
        
            const allChecked = newCheckboxes.every((checkbox) => checkbox.checked);
            const allUnchecked = newCheckboxes.every((checkbox) => !checkbox.checked);
            
            setIsChecked(allChecked);
            setIsIndeterminate(!allChecked && !allUnchecked);

            const newCheckedItems = newCheckboxes
                .filter((item) => item.checked);
                
            onCheckedItemsChange(newCheckedItems);
        },
        [startIndex, checkboxes, onCheckedItemsChange]
    );

	return (
		<Card p='20px' alignItems='center' flexDirection='column' w='100%' height= '100%' {...rest}>
			<Flex alignItems='center' w='100%' mb='20px'>
				<Circle
					size="38px"
					bg={boxBg}
					me="12px"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<Checkbox
						size="lg"
						colorScheme="brandScheme"
                        isChecked={isChecked}
                        isIndeterminate={isIndeterminate}
                        onChange={handleCheckAll}
					/>
				</Circle>
				<Text color={textColor} fontSize='lg' fontWeight='700'>
					{title}
				</Text>
			</Flex>
            {checkboxes?.length !== 0 ? (
                <>
                    <Box px='11px' w='100%'>
                    {checkboxes.slice(startIndex, endIndex).map((item: any, index: number) => (
                        <Flex key={index} w='100%' mb='20px'>
                            <Checkbox
                                me='16px'
                                isChecked={item.checked}
                                colorScheme='brandScheme'
                                onChange={() => handleCheckboxChange(index)}
                            />
                            <Text fontWeight='bold' color={textColor} fontSize='md' textAlign='start'>
                                {item.label}
                            </Text>
                        </Flex>
                    ))}
                    </Box>
                    <Flex justifyContent="space-between" alignItems="flex-end" w="100%" mt="auto">
                        <IconButton
                            aria-label="Move to Left"
                            isDisabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            borderRadius="10px"
                            minWidth="34px"
                            height="34px"
                            icon={<MdKeyboardArrowLeft/>}
                            colorScheme="brand"
                            fontSize="24px"
                        />
                        <IconButton
                            aria-label="Move to Right"
                            isDisabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            borderRadius="10px"
                            minWidth="34px"
                            height="34px"
                            icon={<MdKeyboardArrowRight/>}
                            colorScheme="brand"
                            fontSize="24px"
                        />
                    </Flex>
                </>
            ) : (
                <Empty />
            )
            }
		</Card>
	);
}