import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  Text,
  useColorModeValue,
  Heading,
  Flex,
  SimpleGrid
} from '@chakra-ui/react';

import { HSeparator } from "components/separator/Separator";
import { NavLink } from 'react-router-dom';
import FormField from 'interfaces/FormField';
import { formatValue } from 'utils/formatValue';
import { convertValue } from 'utils/convertValue';
import FieldInput from './FieldInput';

const Form = (props:{
  title: string; 
  button?:string; 
  fields: FormField[];
  isDisabled?: boolean;
  back: string;
  onSubmit: (fieldValues: {[key: string]: any}) => void;
  }) => {
    const { title, button, fields, isDisabled, back } = props;
    const textColor = useColorModeValue('navy.700', 'white');
    const textColorSecondary = 'gray.400';
    const brandStars = useColorModeValue('brand.500', 'brand.400');

    // ahora any, porque products es un objeto
    const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>(
      props.fields.reduce((acc, field) => {
        let fieldValue = field.value;
        if (Array.isArray(field.value) && field.value.length > 0) {
          fieldValue = field.value[0].toString();
        }
        return {
          ...acc,
          [field.name]: fieldValue,
        };
      }, {} as { [key: string]: any })
    );
    
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: { isError: boolean; message: string } }>(
      props.fields.reduce((acc, field) => {
        return {
          ...acc,
          [field.name]: {
            isError: false,
            message: '',
          }
        };
      }, {} as { [key: string]: { isError: boolean; message: string } })
    );

    useEffect(() => {
      const propFieldValues: { [key: string]: any } = props.fields.reduce((acc, field) => {
        let fieldValue = field.value;
        if (Array.isArray(field.value) && field.value.length > 0) {
          fieldValue = field.value[0].toString();
        }
        return {
          ...acc,
          [field.name]: fieldValue,
        };
      }, {} as { [key: string]: any });

      setFieldValues(prevFieldValues => {
        const fieldsToUpdate: { [key: string]: any } = {};
        let updateNecessary = false;

        props.fields.forEach(field => {
          const propValue = propFieldValues[field.name];
          const currentValue = prevFieldValues[field.name];

          if (field.isDisabled || field.name === 'clientName') {    
            if (propValue !== currentValue) {
              fieldsToUpdate[field.name] = propValue;
              updateNecessary = true;
            }
          } 
        });

        if (updateNecessary) {
          return {
            ...prevFieldValues,
            ...fieldsToUpdate,
          };
        }
        return prevFieldValues; 
      });
    }, [props.fields]);

    const handleInputChange = async (fieldName: string, value: any, type: string) => {
      const fieldConfig = props.fields.find(field => field.name === fieldName);

      if (fieldConfig && fieldConfig.onChange) {
          fieldConfig.onChange(value); 
      }

      if (type === 'money'){
        value = formatValue(value);
      }

      if (fieldName.includes('USD') || fieldName.includes('COL')){
        let convert = await convertValue(fieldName, value, fieldValues['date'] || fieldValues['requestDate']);
        fieldValues[convert.newName] = convert.newValue.toString();
      }

      if (fieldName === 'salary'){
        const hours = parseFloat((fieldValues['workedHours'] || '0').replaceAll(',', ''));
        const salary = value.replaceAll(',', '');

        const socialChangesFloat = parseFloat((parseFloat(salary) * 1.51).toFixed(2));
        const hourlySalaryFloat = parseFloat((socialChangesFloat / 192).toFixed(2));
        const expenseSalaryFloat = parseFloat((hours * hourlySalaryFloat).toFixed(2));
        const expenseOvertimeFloat = parseFloat(parseFloat((fieldValues['expenseOvertime'] || '0').replaceAll(',', '')).toFixed(2));
        const totalFloat = expenseSalaryFloat + expenseOvertimeFloat;
        
        const socialChangesValue = formatValue(socialChangesFloat.toString());
        const hourlySalaryValue = formatValue(hourlySalaryFloat.toString());
        const expenseSalaryValue = formatValue(expenseSalaryFloat.toString());
        const totalValue = formatValue(totalFloat.toString());

        fieldValues['socialChanges'] = socialChangesValue;
        fieldValues['hourlySalary'] = hourlySalaryValue;
        fieldValues['expenseSalary'] = expenseSalaryValue;

        fieldValues['amountCOL'] = totalValue;

        let convert = await convertValue('amountCOL', totalValue, fieldValues['date']);
        fieldValues[convert.newName] = convert.newValue.toString();
      }

      if (fieldName === 'workedHours'){
        const hours = parseFloat(value.replaceAll(',', ''));
        const hourlySalary = parseFloat((fieldValues['hourlySalary'] || '0').replaceAll(',', ''));
        const expenseSalaryFloat = parseFloat((hours * hourlySalary).toFixed(2));
        const expenseOvertimeFloat = parseFloat(parseFloat((fieldValues['expenseOvertime'] || '0').replaceAll(',', '')).toFixed(2));
        const totalFloat = expenseSalaryFloat + expenseOvertimeFloat;

        const expenseSalaryValue = formatValue(expenseSalaryFloat.toString());
        const totalValue = formatValue(totalFloat.toString());
        
        fieldValues['expenseSalary'] = expenseSalaryValue;
        fieldValues['amountCOL'] = totalValue;

        let convert = await convertValue('amountCOL', totalValue, fieldValues['date']);
        fieldValues[convert.newName] = convert.newValue.toString();
      }

      if (fieldName === 'overtimeHours' || fieldName === 'overtimeSalary'){
        const val1 = parseFloat(value.replaceAll(',', ''));
        const name2 = fieldName ==='overtimeSalary' ? 'overtimeHours' : 'overtimeSalary';
        const val2 = parseFloat((fieldValues[name2] || '0').replaceAll(',', ''));

        const expenseOvertimeFloat = parseFloat((val1 * val2).toFixed(2));
        const expenseSalaryFloat = parseFloat(parseFloat((fieldValues['expenseSalary'] || '0').replaceAll(',', '')).toFixed(2));

        const totalFloat = expenseSalaryFloat + expenseOvertimeFloat;

        const expenseSalaryValue = formatValue(expenseOvertimeFloat.toString());
        const totalValue = formatValue(totalFloat.toString());

        fieldValues['expenseOvertime'] = expenseSalaryValue;
        fieldValues['amountCOL'] = totalValue;

        let convert = await convertValue('amountCOL', totalValue, fieldValues['date']);
        fieldValues[convert.newName] = convert.newValue.toString();
      }

      setFieldValues((prevValues) => ({
        ...prevValues,
        [fieldName]: value,
      }));
      validateInput(fieldName, value);
    };

    const validateForm = () => {
      let hasErrors = false; 

      // recorrer solo los campos definidos, no todas las keys de fieldValues
      for (const field of fields) {
        const fieldName = field.name;
        const value = fieldValues[fieldName];
        validateInput(fieldName, value);
        if (fieldErrors[fieldName]?.isError) {
          hasErrors = true;
        }
      }  
      return !hasErrors;
    };
    
    const handleSubmit = () => {
      const isFormValid = validateForm();
      if (isFormValid) {
        const modifiedFieldValues: { [key: string]: any } = { ...fieldValues };
        for (const key in modifiedFieldValues) {
          const field = fields.find((field) => field.name === key);
          if (field) {
            if (field.type === 'money' && typeof modifiedFieldValues[key] === 'string') {
              modifiedFieldValues[key] = modifiedFieldValues[key].replace(/,/g, "");
            }
          }
        }
        props.onSubmit(modifiedFieldValues);
      }
    };

    const validateInput = (fieldName: string, value: any) => {
      const fieldConfig = fields.find(field => field.name === fieldName);
      if (!fieldConfig || !fieldConfig.validation) return;

      const stringValue = typeof value === 'string' ? value.trim() : '';

      const { validation } = fieldConfig;
      const { required, maxLength, regex } = validation;

      const isError =
        (required && stringValue === '') ||
        (maxLength && stringValue.length > maxLength) ||
        (regex && !regex.test(stringValue));
    
      const message =
        (required && stringValue === '') ?
          'El campo es requerido.' :
          (maxLength && stringValue.length > maxLength) ?
            `El campo debe tener como máximo ${maxLength} caracteres.` :
            (regex && !regex.test(stringValue)) ?
              'El formato no es válido' :
              '';
    
      const fieldErrorsUpdate = {
        [fieldName]: { isError, message },
      };
    
      setFieldErrors(prevFieldErrors => ({
        ...prevFieldErrors,
        ...fieldErrorsUpdate,
      }));
    };

    const renderFields = () => {
      return fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          fieldValues={fieldValues}
          isDisabled={isDisabled}
          handleInputChange={handleInputChange}
          fieldErrors={fieldErrors}
        />
      ));
    };
    
  return (
    <Box me="auto">
      <Heading color={textColor} fontSize="36px" mb="10px" sx={{ letterSpacing: '-0.72px' }}>
        {title}
      </Heading>
      <Text
          mb="36px"
          ms='4px'
          color={textColorSecondary}
          fontWeight="400"
          fontSize="md"
        >
          {!title.includes('Detalles') && (
            <>¡Ingrese todos los datos requeridos!</>
          )}
      </Text>
      <Flex align='center' mb='25px'>
        <HSeparator />
      </Flex>
      {!title.includes('Detalles') && !title.includes('Planilla')  ? (
        renderFields()
      ) : (
        <SimpleGrid columns={2} spacing={2}>
          {renderFields()}
        </SimpleGrid>
      )}
      {button !== undefined && (
        <>
          <Button
            fontSize="sm"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="50"
            mt="16px"
            mb="12px"
            onClick={handleSubmit}
          >
            {button}
          </Button>
          <Center>
            <NavLink to={back}>
              <Text
                color={brandStars}
                as="span"
                ms="5px"
                fontWeight="500"
                textAlign="center"
              >
                Volver
              </Text>
            </NavLink>
          </Center>
        </>
      )}
    </Box>
  );
};

export default Form;
