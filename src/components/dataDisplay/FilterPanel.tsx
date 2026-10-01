import { Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

type FilterPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  action?: ReactNode;
};

export default function FilterPanel({ title, description, children, activeCount = 0, onClear, action }: FilterPanelProps) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  const bg = useColorModeValue('white', 'navy.800');
  return <Box bg={bg} borderRadius="xl" p={{ base: 4, md: 5 }} mb={4} boxShadow="sm" borderWidth="1px" borderColor="blackAlpha.100">
    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3} mb={4}>
      <Box><Text fontWeight="900">{title}</Text>{description && <Text color={muted} fontSize="sm">{description}</Text>}</Box>
      {action}
    </Flex>
    {children}
    {onClear && activeCount > 0 && <Flex justify="flex-end" mt={3}><Button size="sm" variant="ghost" onClick={onClear}>Limpiar filtros ({activeCount})</Button></Flex>}
  </Box>;
}
