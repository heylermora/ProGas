import { useState } from 'react';

// Chakra imports
import {
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useDisclosure,
	useColorModeValue,
	Flex,
	Icon,
	Text
} from '@chakra-ui/react';

// Assets
import {
	MdDelete
} from 'react-icons/md';

import DeleteModal from 'components/modal/DeleteModal';
import OkModal from 'components/modal/OkModal';

export default function Banner(props: { id?: any, name?: string, service: any, icon: JSX.Element | string; [x: string]: any }) {
	const { id, name, service, icon, ...rest } = props;

	// Ellipsis modals
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isOkModalOpen, setIsOkModalOpen] = useState(false);
	const { isOpen: isOpen1, onOpen: onOpen1, onClose: onClose1 } = useDisclosure();

	// Chakra color mode

	const textColor = useColorModeValue('secondaryGray.500', 'white');
	const textHover = useColorModeValue(
		{ color: 'secondaryGray.900', bg: 'unset' },
		{ color: 'secondaryGray.500', bg: 'unset' }
	);
	const bgList = useColorModeValue('white', 'whiteAlpha.100');
	const bgShadow = useColorModeValue('14px 17px 40px 4px rgba(112, 144, 176, 0.08)', 'unset');
	
	const handleDelete = async (service: { delete: (id: any) => Promise<void> }) => {
		try {
			await service.delete(id);
			console.log('Ok');
			setIsOkModalOpen(true);
			setIsDeleteModalOpen(false);
		} catch (error) {
			console.error('Error:', error);
		}
	};

	const closeOkModalAndReload = () => {
        setIsOkModalOpen(false);
        window.location.reload();
    };

	return (
		<Menu isOpen={isOpen1} onClose={onClose1}>
			<MenuButton {...rest} onClick={onOpen1}>
				{icon}
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
					onClick={() => setIsDeleteModalOpen(true)}
					>
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
					handle={() => handleDelete(service)}
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
