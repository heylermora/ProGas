import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Spinner, Center, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import ComplexTable from 'components/table/ComplexTable';
import AddButton from 'components/button/AddButton';
import InvoiceService from 'services/InvoiceService';
import InvoiceItem from 'interfaces/InvoiceItem';
import Error from 'components/exceptions/Error';

function InvoiceModal(props:{title: string, id: string, isOpen: boolean, onClose: () => void}) {
    const { title, id, isOpen, onClose } = props;
    const [purchaseOrders, setPurchaseOrders] = useState<InvoiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const spinnerColor = useColorModeValue('brand.700', 'white');

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            InvoiceService.getAll(['purchaseorderid'], [id])
                .then((purchaseOrderData:  InvoiceItem[]) => {
                    purchaseOrderData = purchaseOrderData.map(order => ({
                        ...order,
                        date: order.date.split('T')[0] || ''
                    }));
                    setPurchaseOrders(purchaseOrderData);
                })
                .catch(error => {
                    console.error('Error fetching invoices:', error);
                    setIsError(true);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, id]);

    return (
        <>
            <Modal  isOpen={isOpen} onClose={onClose} size="auto">
                <ModalOverlay />
                <ModalContent borderRadius="20px"  w='auto'>
                    <ModalBody>
                        {isError ? (
                            <Error />
                        ) : isLoading ? (
                            <Center>
                                <Spinner size="xl" variant='darkBrand' color={spinnerColor} />
                            </Center>
                        ) : (
                            <>
                                <Flex mt='24px' mb='12px' justifyContent='space-between' align='center'>
                                    <Text isTruncated color={textColor} fontSize='22px' fontWeight='700' lineHeight='100%'>
                                        {title}
                                    </Text>
                                    <AddButton redirect={`/invoice/new/${id}`}/>
                                </Flex>
                                <ComplexTable tableData={purchaseOrders} service={InvoiceService} typeModal='invoice'/>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default InvoiceModal;
