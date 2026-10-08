import { Box, Button, Code, Text, useClipboard, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';
import AppModal from './AppModal';

export default function OkModal({ message, code = '', isOpen, onClose }: { message: ReactNode; code?: string; isOpen: boolean; onClose: () => void }) {
  const { hasCopied, onCopy } = useClipboard(code);
  const subtle = useColorModeValue('gray.50', 'whiteAlpha.100');
  return <AppModal title="¡Proceso exitoso!" isOpen={isOpen} onClose={onClose} size="md">
    <Text>{message}</Text>
    {code && <Box mt={4} p={3} bg={subtle} borderWidth="1px" borderRadius="14px">
      <Text fontSize="sm" mb={2}>Código del pedido</Text>
      <Code display="block" fontSize="xl" fontWeight="900" letterSpacing="1px" p={2} textAlign="center" borderRadius="10px" overflowWrap="anywhere">{code}</Code>
      <Button mt={3} w="100%" colorScheme={hasCopied ? 'green' : 'brand'} onClick={onCopy}>{hasCopied ? 'Código copiado' : 'Copiar código'}</Button>
    </Box>}
  </AppModal>;
}
