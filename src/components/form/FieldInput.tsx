import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  FormHelperText,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import FormField from 'interfaces/FormField';
import ItemsFieldControl from './ItemsFieldControl';

type FieldInputProps = {
  field: FormField;
  fieldValues: { [key: string]: any };
  isDisabled?: boolean;
  handleInputChange: (fieldName: string, value: any, type: string) => void;
  fieldErrors: { [key: string]: { isError: boolean; message: string } };
};

const FieldInput = ({
  field,
  fieldValues,
  isDisabled = false,
  handleInputChange,
  fieldErrors,
}: FieldInputProps) => {
  const textColor = useColorModeValue('navy.700', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const errorInfo = fieldErrors[field.name] || { isError: false, message: '' };
  const isInvalid = errorInfo.isError;

  const handleChange =
    (type: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      handleInputChange(field.name, e.target.value, type);
    };

  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            isRequired
            variant="auth"
            fontSize="sm"
            ms={{ base: '0px', md: '0px' }}
            size="md"
            h="46px"
            value={fieldValues[field.name] ?? ''}
            onChange={handleChange(field.type)}
          >
            {(Array.isArray(field.value) ? field.value : []).map(
              (option: any) => (
                <option key={String(option)} value={option}>
                  {String(option)}
                </option>
              ),
            )}
          </Select>
        );

      case 'items':
        return <ItemsFieldControl {...field.value} />;

      default:
        return (
          <Input
            isRequired
            isDisabled={field.isDisabled ?? false}
            variant="auth"
            fontSize="sm"
            ms={{ base: '0px', md: '0px' }}
            type={field.type}
            fontWeight="500"
            size="md"
            h="46px"
            value={fieldValues[field.name] ?? ''}
            onChange={handleChange(field.type)}
          />
        );
    }
  };

  return (
    <FormControl isDisabled={isDisabled} isInvalid={isInvalid} mb={{ base: "14px", md: "18px" }}>
      <FormLabel
        display="flex"
        ms="4px"
        fontSize="sm"
        fontWeight="700"
        color={textColor}
        mt="0px"
        mb="8px"
      >
        {field.label}
        {field.validation?.required && (
          <Text as="span" color={brandStars} ml="2px">
            *
          </Text>
        )}
      </FormLabel>

      {field.helper !== undefined && (
        <FormHelperText ml="4px" mt="0px" pb="10px" color="secondaryGray.600">
          {field.helper}
        </FormHelperText>
      )}

      {renderInput()}

      <FormErrorMessage ml="4px" fontWeight="600">
        {errorInfo.message}
      </FormErrorMessage>
    </FormControl>
  );
};

export default FieldInput;