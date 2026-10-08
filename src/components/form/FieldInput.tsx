import { Box, Input, Select, Text } from '@chakra-ui/react';
import type FieldDefinition from 'interfaces/FormField';
import React from 'react';
import DeliveryAddressField from './DeliveryAddressField';
import FormField from './FormField';
import ItemsFieldControl from './ItemsFieldControl';

type Props = {
  field: FieldDefinition;
  fieldValues: { [key: string]: any };
  isDisabled?: boolean;
  handleInputChange: (name: string, value: any, type: string) => void;
  fieldErrors: { [key: string]: { isError: boolean; message: string } };
};
export default function FieldInput({ field, fieldValues, isDisabled, handleInputChange, fieldErrors }: Props) {
  const id = `order-${field.name}`;
  const error = fieldErrors[field.name];
  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(field.name, event.target.value, field.type);
  const disabled = Boolean(isDisabled || field.isDisabled);
  const required = Boolean(field.validation?.required);
  if (field.type === 'items' || field.type === 'location') return <Box as="fieldset" border="0" p={0} m={0} mb={4} minW="0">
    <Text as="legend" fontSize="sm" fontWeight="700" mb={2}>{field.label}</Text>
    {field.type === 'items' ? <ItemsFieldControl {...field.value} /> : <DeliveryAddressField value={fieldValues[field.name]} onChange={value => handleInputChange(field.name, value, field.type)} />}
    {field.helper && <Text fontSize="sm" color="gray.500" mt={2}>{field.helper}</Text>}
  </Box>;
  return <FormField id={id} label={field.label} help={field.helper} error={error?.isError ? error.message : undefined}
    isRequired={required} isDisabled={disabled} mb={4}>
    {field.type === 'select' ? <Select id={id} value={fieldValues[field.name] ?? ''} onChange={change}>
        {(Array.isArray(field.value) ? field.value : []).map(option => <option key={String(option)} value={option}>{String(option)}</option>)}
      </Select> : <Input id={id} type={field.type === 'money' ? 'text' : field.type} inputMode={field.type === 'money' ? 'decimal' : undefined}
        value={fieldValues[field.name] ?? ''} onChange={change} />}
  </FormField>;
}
