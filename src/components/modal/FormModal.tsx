import { Box } from '@chakra-ui/react';
import FormActions from 'components/form/FormActions';
import AppModal, { AppModalProps } from './AppModal';

type Props = Omit<AppModalProps, 'footer' | 'onFormSubmit' | 'isBusy'> & {
  onSubmit: () => void | Promise<void>;
  submitLabel: string;
  loadingLabel?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
};

/** Shared form semantics, submit guard and footer, without a second form or scroll area. */
export default function FormModal({ onSubmit, submitLabel, loadingLabel, isSubmitting, isDisabled, children, onClose, ...props }: Props) {
  return <AppModal {...props} onClose={onClose} isBusy={isSubmitting}
    onFormSubmit={event => {
      event.preventDefault();
      if (isSubmitting || isDisabled) return;
      const form = event.currentTarget;
      void onSubmit();
      requestAnimationFrame(() => form.querySelector<HTMLElement>('input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]')?.focus());
    }}
    footer={<FormActions mt={0} onCancel={onClose} showCancel submitLabel={submitLabel} loadingLabel={loadingLabel}
      isLoading={isSubmitting} isDisabled={isDisabled} />}>
    <Box as="fieldset" disabled={isSubmitting} border={0} p={0} m={0} minW={0}>{children}</Box>
  </AppModal>;
}
