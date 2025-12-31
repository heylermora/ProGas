import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Icon,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  Portal
} from '@chakra-ui/react';
import {
  MdOutlineMoreHoriz,
  MdEdit,
  MdDelete,
  MdContentCopy
} from 'react-icons/md';

import OrderService from 'services/OrderService';
import DeleteModal from 'components/modal/DeleteModal';
import OkModal from 'components/modal/OkModal';
import CopyModal from 'components/modal/CopyModal';
import { useOrderRefresh } from 'contexts/OrderRefreshContext';

type BannerProps = {
  id?: string;
  name?: string;
  text?: string;
  [key: string]: any;
};

export default function Banner({ id, name, text, ...rest }: BannerProps) {
  const history = useHistory();
  const { triggerRefresh } = useOrderRefresh();

  const textColor = useColorModeValue('secondaryGray.500', 'white');
  const textHover = useColorModeValue(
    { color: 'secondaryGray.900', bg: 'unset' },
    { color: 'secondaryGray.500', bg: 'unset' }
  );
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgList = useColorModeValue('white', 'whiteAlpha.100');
  const bgShadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'unset'
  );
  const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const bgHover = useColorModeValue(
    { bg: 'secondaryGray.400' },
    { bg: 'whiteAlpha.50' }
  );
  const bgFocus = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.100' }
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOkModalOpen, setIsOkModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const handleDelete = () => {
    if (!id) {
      console.error('ID no disponible para eliminar');
      alert('Error: No hay ID disponible para eliminar');
      return;
    }

    OrderService.delete(id)
      .then(() => {
        triggerRefresh();
        setIsOkModalOpen(true);
        setIsDeleteModalOpen(false);
      })
      .catch(error => {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar la orden: ' + (error.message || 'Error desconocido'));
      });
  };

  const closeOkModalAndReload = () => {
    setIsOkModalOpen(false);
    history.push('/admin/order/index');
  };

  return (
    <>
      <Menu>
        <MenuButton
          alignItems="center"
          justifyContent="center"
          bg={bgButton}
          _hover={bgHover}
          _focus={bgFocus}
          _active={bgFocus}
          w="37px"
          h="37px"
          lineHeight="100%"
          borderRadius="10px"
          {...rest}
        >
          <Icon as={MdOutlineMoreHoriz} color={iconColor} w="24px" h="24px" />
        </MenuButton>

        <Portal>
          <MenuList
            w="150px"
            minW="unset"
            maxW="150px !important"
            border="transparent"
            backdropFilter="blur(63px)"
            bg={bgList}
            boxShadow={bgShadow}
            borderRadius="20px"
            p="15px"
            zIndex="dropdown"
          >
            <MenuItem
              as={Link}
              to={`/admin/order/edit/${id}`}
              transition="0.2s linear"
              color={textColor}
              _hover={textHover}
              p="0px"
              borderRadius="8px"
              _active={{ bg: 'transparent' }}
              _focus={{ bg: 'transparent' }}
              mb="10px"
            >
              <Flex align="center">
                <Icon as={MdEdit} h="16px" w="16px" me="8px" />
                <Text fontSize="sm" fontWeight="400">
                  Editar
                </Text>
              </Flex>
            </MenuItem>

            <MenuItem
              transition="0.2s linear"
              p="0px"
              borderRadius="8px"
              color={textColor}
              _hover={textHover}
              _active={{ bg: 'transparent' }}
              _focus={{ bg: 'transparent' }}
              mb="10px"
		      onClick={() => setIsCopyModalOpen(true)}
            >
              <Flex align="center">
                <Icon as={MdContentCopy} h="16px" w="16px" me="8px" />
                <Text fontSize="sm" fontWeight="400">
                  Copiar
                </Text>
              </Flex>
            </MenuItem>

            <MenuItem
              transition="0.2s linear"
              p="0px"
              borderRadius="8px"
              color={textColor}
              _hover={textHover}
              _active={{ bg: 'transparent' }}
              _focus={{ bg: 'transparent' }}
              mb="10px"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Flex align="center">
                <Icon as={MdDelete} h="16px" w="16px" me="8px" />
                <Text fontSize="sm" fontWeight="400">
                  Eliminar
                </Text>
              </Flex>
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>

      {isDeleteModalOpen && (
        <DeleteModal
          message={
            <>
              ¿Desea eliminar <strong>{name}</strong>?
            </>
          }
          handle={handleDelete}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      <OkModal
        message={
          <>
            ¡<strong>{name}</strong> eliminado!
          </>
        }
        isOpen={isOkModalOpen}
        onClose={closeOkModalAndReload}
      />

	  <CopyModal
      isOpen={isCopyModalOpen}
      onClose={() => setIsCopyModalOpen(false)}
      message={
        <>
        ¿Desea copiar los datos de <strong>{name}</strong>?
        </>
      }
      copyText={text}
	  />

    </>
  );
}