import { FormControl, FormLabel, Switch } from '@chakra-ui/react';

type ActiveSwitchProps = { id: string; isChecked: boolean; onChange: (checked: boolean) => void; label?: string; isDisabled?: boolean };

export default function ActiveSwitch({ id, isChecked, onChange, label = 'Activo', isDisabled }: ActiveSwitchProps) {
  return <FormControl display="flex" alignItems="center" w="auto" isDisabled={isDisabled}>
    <Switch id={id} aria-label={label} colorScheme="brand" isChecked={isChecked} onChange={event => onChange(event.target.checked)} />
    <FormLabel htmlFor={id} mb="0" ml={3}>{label}</FormLabel>
  </FormControl>;
}

