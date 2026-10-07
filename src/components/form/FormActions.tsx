import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

type FormActionsProps = {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel: string;
  loadingLabel?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  message?: ReactNode;
  showCancel?: boolean;
  mt?: number;
};

/** A single primary action, matching the order forms; navigation stays in the header. */
export default function FormActions({ onCancel, showCancel = false, onSubmit, submitLabel, loadingLabel = 'Guardando', isLoading, isDisabled, message, mt = 6 }: FormActionsProps) {
  return <Stack spacing={2} mt={mt}>
    {message && <Text fontSize="sm" color="gray.500">{message}</Text>}
    <Box display="flex" gap={3}>
      {showCancel && onCancel && <Button type="button" variant="ghost" flexShrink={0} whiteSpace="nowrap" onClick={onCancel} isDisabled={isLoading}>Cancelar</Button>}
      <Button type={onSubmit ? 'button' : 'submit'} onClick={onSubmit} variant="brand" flex="1" minW={0} w="100%" minH="48px"
      isLoading={isLoading} loadingText={loadingLabel} isDisabled={isDisabled}>{submitLabel}</Button></Box>
  </Stack>;
}
