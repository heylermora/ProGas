import { Button, ButtonProps } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { ReactNode } from 'react';

type BackButtonProps = Omit<ButtonProps, 'leftIcon'> & {
  children?: ReactNode;
  to?: string;
};

/** Consistent navigation action for returning to the previous screen or list. */
export default function BackButton({ children = 'Volver', to, variant = 'ghost', ...props }: BackButtonProps) {
  const content = <Button
    leftIcon={<MdArrowBack />}
    variant={variant}
    px="2"
    whiteSpace="nowrap"
    fontWeight="700"
    {...props}
  >{children}</Button>;

  if (!to) return content;

  return <Button
    as={RouterLink}
    to={to}
    leftIcon={<MdArrowBack />}
    variant={variant}
    px="2"
    whiteSpace="nowrap"
    fontWeight="700"
    {...props}
  >{children}</Button>;
}
