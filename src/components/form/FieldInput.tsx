import React, { useState } from 'react';
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
import Map from './Map';


const FieldInput = (props: { 
    field: FormField;
    fieldValues: {[key: string]: string};
    isDisabled: boolean;
    handleInputChange:  (fieldName: string, value: string, type: string) => void;
    fieldErrors: {[key: string]: { isError: boolean; message: string }};
}) => {
    const { field, fieldValues, isDisabled, handleInputChange, fieldErrors} = props;
    const textColor = useColorModeValue('navy.700', 'white');
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    return (
        <FormControl key={field.name} isDisabled={isDisabled} isInvalid={fieldErrors[field.name].isError}>    
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mt="16px"
            >
              {field.label}
              <Text color={brandStars}>*</Text>
            </FormLabel>
            {field.helper !== undefined && (
              <FormHelperText ml="4px" mt="0px" pb="12px">{field.helper}</FormHelperText>
            )}
            {field.type === 'select' ? (
              <Select
                isRequired={true}
                variant="auth"
                fontSize="sm"
                ms={{ base: '0px', md: '0px' }}
                value={fieldValues[field.name]}
                onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              >
                {field.value.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : field.type === 'location' ? (
                <Map/>
            ) : (
              <Input
                isRequired={true}
                isDisabled={field.isDisabled || false}
                variant="auth"
                fontSize="sm"
                ms={{ base: '0px', md: '0px' }}
                type={field.type}
                fontWeight="500"
                size="md"
                value={fieldValues[field.name]}
                onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
              />
            )}
            <FormErrorMessage ml="12px">{fieldErrors[field.name].message}</FormErrorMessage>
        </FormControl>
    );
};

export default FieldInput;