import { IconButton } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function AddButton(props:{ redirect: string }) {
  const {redirect}= props
  return (
    <Link to={redirect}>
      <IconButton
        width="37px"
        height="37px"
        flexShrink={0}
        borderRadius="10px"
        background="var(--secondary-grey-300, #F4F7FE)"
        aria-label="Custom Button"
        icon={<MdAdd color="#4318FF" />}
      />
    </Link>
  );
}