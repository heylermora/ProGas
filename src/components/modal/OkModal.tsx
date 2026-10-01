import { Box, Button, Code, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text, useClipboard } from '@chakra-ui/react';
import { ReactNode } from 'react';

function OkModal(props:{message: ReactNode, code?: string, isOpen: boolean, onClose: () => void}) {
    const { message, code = '', isOpen, onClose } = props;
    const { hasCopied, onCopy } = useClipboard(code);

    return (
        <>
            <Modal colorScheme="green" isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="white" borderRadius="20px">
                <ModalHeader bg="white"
                    borderTopLeftRadius="20px" 
                    borderTopRightRadius="20px"
                >
                    ¡Proceso exitoso!
                </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb="24px">
                        <Text>{message}</Text>
                        {code && (
                            <Box mt="16px" p="14px" bg="gray.50" borderWidth="1px" borderRadius="14px">
                                <Text fontSize="sm" color="gray.600" mb="6px">Código del pedido</Text>
                                <Code display="block" fontSize="xl" fontWeight="900" letterSpacing="1px" p="10px" textAlign="center" borderRadius="10px">{code}</Code>
                                <Button mt="10px" w="100%" colorScheme={hasCopied ? 'green' : 'brand'} onClick={onCopy}>
                                    {hasCopied ? 'Código copiado' : 'Copiar código'}
                                </Button>
                            </Box>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default OkModal;
