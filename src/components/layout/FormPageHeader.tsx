import { Box, Button, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { MdArrowBack } from 'react-icons/md';
import { ReactNode } from 'react';

type FormPageHeaderProps = { title: string; description?: string; onBack: () => void; backLabel?: string; status?: ReactNode };

export default function FormPageHeader({ title, description, onBack, backLabel = 'Volver', status }: FormPageHeaderProps) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  return <Box as="header" mb={{ base: 5, md: 7 }}>
    <Button aria-label={backLabel} variant="ghost" onClick={onBack} leftIcon={<MdArrowBack />} px="2" mb="12px" whiteSpace="nowrap">
      {backLabel}
    </Button>
    <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={3}>
      <Box minW="0">
        <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} lineHeight="1.15" overflowWrap="anywhere">{title}</Heading>
        {description && <Text color={muted} mt="5px" maxW="680px">{description}</Text>}
      </Box>
      {status && <Box flexShrink={0}>{status}</Box>}
    </Flex>
  </Box>;
}
