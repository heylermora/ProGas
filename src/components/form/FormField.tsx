import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import { ReactNode } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  help?: string;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
};

export default function FormField({ id, label, children, help, error, isRequired, isDisabled }: FormFieldProps) {
  return <FormControl isRequired={isRequired} isDisabled={isDisabled} isInvalid={Boolean(error)}>
    <FormLabel htmlFor={id}>{label}</FormLabel>
    {children}
    {help && !error && <FormHelperText>{help}</FormHelperText>}
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
  </FormControl>;
}

