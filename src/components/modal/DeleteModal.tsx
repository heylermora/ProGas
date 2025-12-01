import { 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter, 
    Button, 
} from '@chakra-ui/react';

function DeleteModal(props:{message:any, handle:(service: any) => void, isOpen: boolean, onClose: () => void}) {
    const { message, handle, isOpen, onClose } = props;
    return (
        <Modal colorScheme="red" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg="red.200" borderRadius="20px">
                <ModalHeader bg="white"
                    borderTopLeftRadius="20px" 
                    borderTopRightRadius="20px"
                >
                    ¡Eliminar!
                </ModalHeader>
                <ModalBody>
                    {message}
                </ModalBody>
                <ModalFooter >
                    <Button colorScheme="red" onClick={handle} mr={3}>
                        Aceptar
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default DeleteModal;