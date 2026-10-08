import { Box } from '@chakra-ui/react';
import Card from 'components/card/Card';
import type { ReactNode } from 'react';
import Form from './Form';

type FormPanelProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
};

export default function FormPanel({ title, description, onClose, children, footer, onSubmit, isSubmitting }: FormPanelProps) {

  return <Card p={{ base: 5, md: 6 }} mb={5} borderColor="brand.200">
    <Form isSubmitting={isSubmitting} title={title} description={description} onBack={onClose} onFormSubmit={event => { event.preventDefault(); onSubmit?.(); }}>
      {children}
      {footer && <Box mt={6}>{footer}</Box>}
    </Form>
  </Card>;
}
