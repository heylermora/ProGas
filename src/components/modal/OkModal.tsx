import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';

function OkModal(props:{message:any, isOpen: boolean, onClose: () => void}) {
    const { message, isOpen, onClose } = props;

    return (
        <>
            <Modal colorScheme="green" isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="green.200" borderRadius="20px">
                <ModalHeader bg="white"
                    borderTopLeftRadius="20px" 
                    borderTopRightRadius="20px"
                >
                    ¡Proceso exitoso!
                </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {message}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export default OkModal;
