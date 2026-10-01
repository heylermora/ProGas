import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

type DeleteModalProps = {
  message: ReactNode;
  handle: () => void;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  confirmLabel?: string;
  isLoading?: boolean;
};

export default function DeleteModal({ message, handle, isOpen, onClose, title = 'Confirmar eliminación', confirmLabel = 'Eliminar', isLoading }: DeleteModalProps) {
  return <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent borderRadius="20px">
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody><Text as="div" color="gray.600">{message}</Text></ModalBody>
      <ModalFooter gap={2}>
        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>Cancelar</Button>
        <Button colorScheme="red" onClick={handle} isLoading={isLoading}>{confirmLabel}</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>;
}
