import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Center,
  Text,
  useColorModeValue,
  Heading,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';

import { HSeparator } from 'components/separator/Separator';
import { NavLink } from 'react-router-dom';
import FormField from 'interfaces/FormField';
import { formatValue } from 'utils/formatValue';
import FieldInput from './FieldInput';

type Props = {
  title: string;
  button?: string;
  fields: FormField[];
  isDisabled?: boolean;
  back?: string;
  onSubmit: (fieldValues: { [key: string]: any }) => void;
};

const Form = ({ title, button, fields, isDisabled, back, onSubmit }: Props) => {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');

  const buildInitialValues = useCallback(() => {
    return fields.reduce((acc, field) => {
      let value = field.value;
      if (Array.isArray(value) && value.length > 0) {
        value = value[0].toString();
      }
      acc[field.name] = value;
      return acc;
    }, {} as { [key: string]: any });
  }, [fields]);

  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>(() => buildInitialValues());

  const [fieldErrors, setFieldErrors] = useState<
    { [key: string]: { isError: boolean; message: string } }
  >(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = { isError: false, message: '' };
      return acc;
    }, {} as { [key: string]: { isError: boolean; message: string } })
  );

  useEffect(() => {
    const propValues = buildInitialValues();

    setFieldValues(prev => {
      const updates: { [key: string]: any } = {};
      let shouldUpdate = false;

      fields.forEach(f => {
        if (f.isDisabled || f.name === 'clientName') {
          if (propValues[f.name] !== prev[f.name]) {
            updates[f.name] = propValues[f.name];
            shouldUpdate = true;
          }
        }
      });

      return shouldUpdate ? { ...prev, ...updates } : prev;
    });
  }, [fields, buildInitialValues]);

  const validateInput = (fieldName: string, value: any) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field?.validation) return { isError: false, message: '' };

    const stringValue = typeof value === 'string' ? value.trim() : '';
    const { required, maxLength, regex } = field.validation;

    const isError =
      (required && stringValue === '') ||
      (maxLength && stringValue.length > maxLength) ||
      (regex && !regex.test(stringValue));

    const message =
      required && stringValue === ''
        ? 'El campo es requerido.'
        : maxLength && stringValue.length > maxLength
        ? `El campo debe tener como máximo ${maxLength} caracteres.`
        : regex && !regex.test(stringValue)
        ? 'El formato no es válido'
        : '';

    return { isError, message };
  };

  const handleInputChange = (fieldName: string, value: any, type: string) => {
    const field = fields.find(f => f.name === fieldName);
    field?.onChange?.(value);

    if (type === 'money') {
      value = formatValue(value);
    }

    setFieldValues(prev => ({ ...prev, [fieldName]: value }));

    const error = validateInput(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateForm = () => {
    const errors: typeof fieldErrors = {};
    let hasErrors = false;

    fields.forEach(field => {
      const result = validateInput(field.name, fieldValues[field.name]);
      errors[field.name] = result;
      if (result.isError) hasErrors = true;
    });

    setFieldErrors(prev => ({ ...prev, ...errors }));
    return !hasErrors;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = { ...fieldValues };
    fields.forEach(f => {
      if (f.type === 'money' && typeof payload[f.name] === 'string') {
        payload[f.name] = payload[f.name].replace(/,/g, '');
      }
    });

    onSubmit(payload);
  };

  const renderFields = () =>
    fields.map(field => (
      <FieldInput
        key={field.name}
        field={field}
        fieldValues={fieldValues}
        isDisabled={isDisabled}
        handleInputChange={handleInputChange}
        fieldErrors={fieldErrors}
      />
    ));

  return (
    <Box me="auto" w="100%" maxW="100%">
      <Heading color={textColor} fontSize={{ base: '26px', md: '34px' }} lineHeight="1.12" mb="10px" sx={{ letterSpacing: '-0.72px' }}>
        {title}
      </Heading>

      {!title.includes('Detalles') && (
        <Text mb={{ base: "24px", md: "34px" }} ms="4px" color={textColorSecondary} fontWeight="400" fontSize="md">
          ¡Ingrese todos los datos requeridos!
        </Text>
      )}

      <Flex align="center" mb={{ base: "22px", md: "28px" }}>
        <HSeparator />
      </Flex>

      {!title.includes('Detalles') && !title.includes('Planilla') ? (
        renderFields()
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 5 }}>
          {renderFields()}
        </SimpleGrid>
      )}

      {button && (
        <>
          <Button
            fontSize="sm"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="52px"
            mt="24px"
            mb="12px"
            onClick={handleSubmit}
          >
            {button}
          </Button>

          {back && (
            <Center mt="6px">
              <NavLink to={back}>
                <Text color={brandStars} as="span" ms="5px" fontWeight="500">
                  Volver
                </Text>
              </NavLink>
            </Center>
          )}
        </>
      )}
    </Box>
  );
};

export default Form;