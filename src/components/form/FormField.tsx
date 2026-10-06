import { FormControl, FormControlProps, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import { Children, cloneElement, isValidElement, ReactNode, useState } from 'react';

let nextFieldId = 0;
type FormFieldProps = Omit<FormControlProps, 'label'> & {
  id?: string;
  label: ReactNode;
  children: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
};

// Associate labels even when a control lives inside an InputGroup or layout wrapper.
function associateControl(children: ReactNode, id: string): ReactNode {
  return Children.map(children, child => {
    if (!isValidElement<any>(child)) return child;
    if (child.props.type === 'button' || child.props.type === 'submit') return child;
    const isControl = child.props.onChange || child.props.value !== undefined || ['input', 'select', 'textarea'].includes(String(child.type));
    if (isControl) return cloneElement(child, { id: child.props.id || id });
    if (child.props.children) return cloneElement(child, { children: associateControl(child.props.children, id) });
    return child;
  });
}

function existingControlId(children: ReactNode): string | undefined {
  let id: string | undefined;
  Children.forEach(children, child => {
    if (!isValidElement<any>(child) || id) return;
    if (child.props.id && (child.props.onChange || child.props.type)) id = child.props.id;
    else if (child.props.children) id = existingControlId(child.props.children);
  });
  return id;
}

export default function FormField({ id, label, children, help, error, isInvalid, ...props }: FormFieldProps) {
  const [generatedId] = useState(() => `form-field-${++nextFieldId}`);
  const controlId = id || existingControlId(children) || generatedId;
  return <FormControl {...props} isInvalid={isInvalid ?? Boolean(error)}>
    <FormLabel htmlFor={controlId}>{label}</FormLabel>
    {associateControl(children, controlId)}
    {help && !(isInvalid ?? Boolean(error)) && <FormHelperText>{help}</FormHelperText>}
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
  </FormControl>;
}
