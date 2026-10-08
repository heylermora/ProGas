import { Box, Heading, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

export default function FormSection({ title, description, children, first = false }: { title: string; description?: string; children: ReactNode; first?: boolean }) {
  const muted = useColorModeValue('gray.600', 'gray.300');
  const border = useColorModeValue('gray.200', 'whiteAlpha.200');
  return <Box as="section" aria-label={title} minW={0} borderTopWidth={first ? 0 : '1px'} borderColor={border} pt={first ? 0 : 6}>
    <Stack spacing={4}>
      <Box><Heading as="h2" size="sm">{title}</Heading>{description && <Text mt={1} fontSize="sm" color={muted}>{description}</Text>}</Box>
      {children}
    </Stack>
  </Box>;
}
