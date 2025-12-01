import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Flex,
  Text,
  useColorModeValue,
  Box,
  Icon,
  AccordionIcon,
  Spinner,
  Center,
} from '@chakra-ui/react';
import AddButton from 'components/button/AddButton';
import ComplexTable from 'components/table/ComplexTable';
import Card from 'components/card/Card';
import Error from 'components/exceptions/Error';

export default function ExpenseCard(props: { title: string, link: string, type: string, service: any, id: any }) {
  const textColor = useColorModeValue('navy.700', 'white');
  const { title, link, type, service, id } = props;
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const spinnerColor = useColorModeValue('brand.700', 'white');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const responseData = await service.getAll(['projectid'], id);
        const updatedData = responseData.map((order: any) => ({
          ...order,
          date: order.date.split('T')[0] || ''
        }));
        setData(updatedData);
      } catch (error) {
        console.error('Error:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };    

    fetchData();
  }, [service, id]);

  return (
    <>
      {isLoading ? (
          <Center>
              <Spinner size="xl" variant='darkBrand' color={spinnerColor} />
          </Center>
        ) : (
          <Card p='20px' mb="18px">
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Flex justifyContent='space-between' align='center'>
                      <Flex align='center'>
                        <Icon as={AccordionIcon} mr="2" boxSize={4} />
                        <Text isTruncated color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
                          {title}
                        </Text>
                      </Flex>
                      <AddButton redirect={`/${link}/new/${id}`} />
                    </Flex>
                  </Box>
                </AccordionButton>
                <AccordionPanel>
                  {isError ? (
                    <Error />
                  ) : (
                    <ComplexTable tableData={data} service={service} typeModal={type} />
                  )
                  }
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Card>
      )}
    </>
  );

}
