import {
Box,
BoxProps
} from '@chakra-ui/react';
import { FormEventHandler, ReactNode, useCallback, useEffect, useState } from 'react';

import FormPageHeader from 'components/layout/FormPageHeader';
import { HSeparator } from 'components/separator/Separator';
import FormField from 'interfaces/FormField';
import { formatValue } from 'utils/formatValue';
import FieldInput from './FieldInput';
import FormActions from './FormActions';

type Props = {
  title?: string;
  button?: string;
  fields?: FormField[];
  isDisabled?: boolean;
  back?: string;
  onSubmit?: (fieldValues: { [key: string]: any }) => void;
  children?: ReactNode;
  onFormSubmit?: FormEventHandler<HTMLDivElement>;
  description?: string;
  status?: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  submitLabel?: string;
  loadingLabel?: string;
  isSubmitting?: boolean;
  footerMessage?: ReactNode;
} & Omit<BoxProps, 'title' | 'onSubmit' | 'children'>;

const Form = ({ title = '', button, fields = [], isDisabled, back, onSubmit, children, onFormSubmit, description, status, backLabel, onBack, submitLabel, loadingLabel = 'Guardando', isSubmitting, footerMessage, ...containerProps }: Props) => {

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

    const stringValue = value == null ? '' : String(value).trim();
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

    onSubmit?.(payload);
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

  const header = title ? <>
    <FormPageHeader title={title} description={description || (fields.length ? 'Los campos marcados con * son obligatorios.' : undefined)} status={status} onBack={onBack} back={back} />
    <HSeparator mb={6} />
  </> : null;

  return <Box as="form" me="auto" w="100%" maxW="100%" noValidate aria-label={title || undefined}
    onSubmit={event => { event.preventDefault(); if (isSubmitting || isDisabled) return; if (children) onFormSubmit?.(event); else handleSubmit(); }} {...containerProps}>
    {header}
    {children || renderFields()}
    {(submitLabel || button) && <FormActions submitLabel={submitLabel || button} isLoading={isSubmitting}
      isDisabled={isDisabled} loadingLabel={loadingLabel} message={footerMessage} />}
  </Box>;
};

export default Form;
