import { IconButton } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function AddButton(props:{ redirect: string }) {
  const {redirect}= props
  return (
    <Link to={redirect}>
      <IconButton
        width="44px"
        height="44px"
        minW="44px"
        flexShrink={0}
        borderRadius="14px"
        background="var(--secondary-grey-300, #F4F7FE)"
        aria-label="Agregar nuevo registro"
        icon={<MdAdd color="#4318FF" size="22px" />}
        _hover={{ transform: 'translateY(-1px)', boxShadow: '0 10px 20px rgba(67, 24, 255, 0.18)' }}
      />
    </Link>
  );
}