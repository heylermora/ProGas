import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Spinner, Center, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import ComplexTable from 'components/table/ComplexTable';
import AddButton from 'components/button/AddButton';
import ReceiptService from 'services/ReceiptService';
import ReceiptItem from 'interfaces/ReceiptItem';
import Error from 'components/exceptions/Error';

function ReceiptModal(props:{title: string, id: string, isOpen: boolean, onClose: () => void}) {
    const { title, id, isOpen, onClose } = props;
    const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const spinnerColor = useColorModeValue('brand.700', 'white');

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            ReceiptService.getAll(['invoiceid'], [id])
                .then((purchaseOrderData:  ReceiptItem[]) => {
                    purchaseOrderData = purchaseOrderData.map(order => ({
                        ...order,
                        date: order.date.split('T')[0] || ''
                    }));
                    setReceipts(purchaseOrderData);
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
                                    <AddButton redirect={`/receipt/new/${id}`}/>
                                </Flex>
                                <ComplexTable tableData={receipts} service={ReceiptService} typeModal='receipt'/>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default ReceiptModal;
