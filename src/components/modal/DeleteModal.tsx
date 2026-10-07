import { Button, Flex, Text } from '@chakra-ui/react';
import { ReactNode, useRef } from 'react';
import AppModal from './AppModal';

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
  const cancelRef = useRef<HTMLButtonElement>(null);
  return <AppModal title={title} isOpen={isOpen} onClose={onClose} size="md" role="alertdialog" initialFocusRef={cancelRef} isBusy={isLoading}
    footer={<Flex gap={3}><Button ref={cancelRef} type="button" variant="ghost" onClick={onClose} isDisabled={isLoading}>Cancelar</Button>
      <Button type="button" flex="1" colorScheme="red" onClick={handle} isLoading={isLoading}>{confirmLabel}</Button></Flex>}>
    <Text>{message}</Text>
  </AppModal>;
}
