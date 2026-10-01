import { Button, Flex } from '@chakra-ui/react';

type FormActionsProps = {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loadingLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
};

export default function FormActions({ onCancel, onSubmit, submitLabel, loadingLabel = 'Guardando', isLoading, isDisabled }: FormActionsProps) {
  return <Flex gap={2} justify="flex-end">
    <Button variant="ghost" onClick={onCancel} isDisabled={isLoading}>Cancelar</Button>
    <Button colorScheme="brand" px={7} onClick={onSubmit} isLoading={isLoading} loadingText={loadingLabel} isDisabled={isDisabled}>{submitLabel}</Button>
  </Flex>;
}

