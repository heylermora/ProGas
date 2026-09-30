import { Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { MdClose } from 'react-icons/md';
import Card from 'components/card/Card';

type FormPanelProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
};

export default function FormPanel({ title, description, onClose, children, footer, closeLabel = 'Cerrar' }: FormPanelProps) {
  const muted = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  return (
    <Card as="section" p={{ base: 5, md: 6 }} mb={5} borderColor="brand.200">
      <Flex justify="space-between" align="flex-start" gap={4} mb={5}>
        <Box>
          <Text as="h2" fontSize="lg" fontWeight="800">{title}</Text>
          {description && <Text fontSize="sm" color={muted}>{description}</Text>}
        </Box>
        <Button aria-label={closeLabel} leftIcon={<MdClose />} size="sm" variant="ghost" onClick={onClose}>{closeLabel}</Button>
      </Flex>
      {children}
      {footer && <Box mt={6}>{footer}</Box>}
    </Card>
  );
}
