import {
Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
ModalHeader, ModalOverlay, ModalProps, Text, useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FormEventHandler, ReactNode } from 'react';

export type AppModalProps = Omit<ModalProps, 'children' | 'scrollBehavior' | 'isCentered'> & {
  title: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  isBusy?: boolean;
  appearance?: 'default' | 'media';
  placement?: 'center' | 'station';
  onFormSubmit?: FormEventHandler<HTMLElement>;
  role?: 'dialog' | 'alertdialog';
};

/** One scroll surface: the body. The title, close action and footer stay visible. */
export default function AppModal({ title, description, children, footer, isBusy = false, appearance = 'default',
  placement = 'center', onFormSubmit, role = 'dialog', size = 'xl', onClose, ...modalProps }: AppModalProps) {
  const surface = useColorModeValue('white', 'navy.800');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const media = appearance === 'media';
  const station = placement === 'station';
  const close = () => { if (!isBusy) onClose(); };
  return <Modal {...modalProps} size={size} onClose={close} scrollBehavior="inside" isCentered={!station}
    closeOnEsc={!isBusy} closeOnOverlayClick={!isBusy}>
    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
    <ModalContent as={onFormSubmit ? motion.form : motion.section} onSubmit={onFormSubmit} {...(onFormSubmit ? { noValidate: true } : {})} role={role}
      aria-busy={isBusy || undefined} display="flex" minH={0} w="calc(100% - 24px)" my={3} mx={3}
      maxH="min(760px, calc(100vh - 24px))" sx={{ '@supports (height: 100dvh)': { maxHeight: 'min(760px, calc(100dvh - 24px))' } }}
      {...(station ? {
        position: 'fixed' as const, bottom: 0, right: 0,
        top: { base: 'auto', md: 0 }, w: { base: '100%', md: '440px' },
        maxW: '100%', m: 0, mx: 0, my: 0,
        maxH: { base: '85vh', md: '100vh' }, h: { base: 'auto', md: '100vh' },
        sx: { '@supports (height: 100dvh)': { maxHeight: { base: '85dvh', md: '100dvh' }, height: { base: 'auto', md: '100dvh' } } },
        borderRadius: { base: '24px 24px 0 0', md: '24px 0 0 24px' },
      } : {})}
      borderRadius={station ? { base: '24px 24px 0 0', md: '24px 0 0 24px' } : '20px'} borderWidth="1px" borderColor={media ? 'whiteAlpha.200' : border}
      bg={media ? 'navy.900' : surface} color={media ? 'white' : undefined} overflow="hidden">
      <Box flexShrink={0} px={{ base: 5, md: 6 }} pt={5} pb={4} pr="60px" borderBottomWidth="1px" borderColor={media ? 'whiteAlpha.200' : border}>
        <ModalHeader p={0}><Box as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="800" lineHeight="short" overflowWrap="anywhere">{title}</Box></ModalHeader>
        {description && <Text mt={1} color={media ? 'gray.300' : muted} fontSize="sm" fontWeight="400">{description}</Text>}
      </Box>
      <ModalCloseButton aria-label="Cerrar" top={4} right={3} size="lg" isDisabled={isBusy} />
      <ModalBody px={{ base: 5, md: 6 }} py={5} minH={0} overflowY="auto" overscrollBehavior="contain">
        {children}
      </ModalBody>
      {footer && <ModalFooter display="block" flexShrink={0} px={{ base: 5, md: 6 }} py={4} pb={station ? 'max(16px, env(safe-area-inset-bottom))' : 4} borderTopWidth="1px" borderColor={media ? 'whiteAlpha.200' : border}>
        {footer}
      </ModalFooter>}
    </ModalContent>
  </Modal>;
}
