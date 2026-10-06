import { IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useState } from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';
import FormField from './FormField';

type Props = { id: string; value: string; onChange: (value: string) => void; isNew?: boolean; isDisabled?: boolean; label?: string; error?: string };
export default function PasswordField({ id, value, onChange, isNew, isDisabled, label = 'Contraseña', error }: Props) {
  const [visible, setVisible] = useState(false);
  return <FormField id={id} label={label} error={error} isRequired isDisabled={isDisabled} help={isNew ? 'Al menos 6 caracteres.' : undefined}>
    <InputGroup>
      <Input id={id} type={visible ? 'text' : 'password'} value={value} autoComplete={isNew ? 'new-password' : 'current-password'}
        onChange={event => onChange(event.target.value)} pr="48px" />
      <InputRightElement h="46px"><IconButton type="button" variant="ghost" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        icon={visible ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />} onClick={() => setVisible(!visible)} size="sm" /></InputRightElement>
    </InputGroup>
  </FormField>;
}
