import { useState } from 'react';
import { Link } from 'react-router-dom';
// Chakra imports
import {
	Icon,
	Flex,
	Text,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useDisclosure,
	useColorModeValue
} from '@chakra-ui/react';

// Assets
import {
	MdOutlineMoreHoriz,
	MdEdit,
	MdDelete
} from 'react-icons/md';

import ProjectService from 'services/OrderService';
import DeleteModal from 'components/modal/DeleteModal';
import OkModal from 'components/modal/OkModal';

export default function Banner(props: { id?: any, name?: string, [x: string]: any }) {
	const { id, name, ...rest } = props;

	const textColor = useColorModeValue('secondaryGray.500', 'white');
	const textHover = useColorModeValue(
		{ color: 'secondaryGray.900', bg: 'unset' },
		{ color: 'secondaryGray.500', bg: 'unset' }
	);
	const iconColor = useColorModeValue('brand.500', 'white');
	const bgList = useColorModeValue('white', 'whiteAlpha.100');
	const bgShadow = useColorModeValue('14px 17px 40px 4px rgba(112, 144, 176, 0.08)', 'unset');
	const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
	const bgHover = useColorModeValue({ bg: 'secondaryGray.400' }, { bg: 'whiteAlpha.50' });
	const bgFocus = useColorModeValue({ bg: 'secondaryGray.300' }, { bg: 'whiteAlpha.100' });

	// Ellipsis modals
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isOkModalOpen, setIsOkModalOpen] = useState(false);

	const { isOpen: isOpen1, onOpen: onOpen1, onClose: onClose1 } = useDisclosure();
	
	const handleDelete = () => {
        ProjectService.delete(id)
            .then(() => {
                console.log('Ok');
				setIsOkModalOpen(true);
				setIsDeleteModalOpen(false);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

	const closeOkModalAndReload = () => {
        setIsOkModalOpen(false);
        window.location.reload();
    };

	return (
		<Menu isOpen={isOpen1} onClose={onClose1}>
			<MenuButton
				alignItems='center'
				justifyContent='center'
				bg={bgButton}
				_hover={bgHover}
				_focus={bgFocus}
				_active={bgFocus}
				w='37px'
				h='37px'
				lineHeight='100%'
				onClick={onOpen1}
				borderRadius='10px'
				{...rest}>
				<Icon as={MdOutlineMoreHoriz} color={iconColor} w='24px' h='24px' />
			</MenuButton>
			<MenuList
				w='150px'
				minW='unset'
				maxW='150px !important'
				border='transparent'
				backdropFilter='blur(63px)'
				bg={bgList}
				boxShadow={bgShadow}
				borderRadius='20px'
				p='15px'>
				<MenuItem
					as={Link}
					to={`/project/edit/${id}`}
					transition='0.2s linear'
					color={textColor}
					_hover={textHover}
					p='0px'
					borderRadius='8px'
					_active={{
						bg: 'transparent'
					}}
					_focus={{
						bg: 'transparent'
					}}
					mb='10px'>
					<Flex align='center'>
						<Icon as={MdEdit} h='16px' w='16px' me='8px' />
						<Text fontSize='sm' fontWeight='400'>
							Editar
						</Text>
					</Flex>
				</MenuItem>
				<MenuItem
					transition='0.2s linear'
					p='0px'
					borderRadius='8px'
					color={textColor}
					_hover={textHover}
					_active={{
						bg: 'transparent'
					}}
					_focus={{
						bg: 'transparent'
					}}
					mb='10px'
					onClick={() => setIsDeleteModalOpen(true)}>
					<Flex align='center'>
						<Icon as={MdDelete} h='16px' w='16px' me='8px' />
						<Text fontSize='sm' fontWeight='400'>
							Eliminar
						</Text>
					</Flex>
				</MenuItem>
			</MenuList>
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
						!<strong>{name}</strong> eliminado!
					</>
				}
				isOpen={isOkModalOpen}
				onClose={closeOkModalAndReload}
			/>
		</Menu>
	);
}
