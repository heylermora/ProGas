import { Button, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { MdArrowBack } from 'react-icons/md';
import { ReactNode } from 'react';

type FormPageHeaderProps = { title: string; description?: string; onBack: () => void; backLabel?: string; status?: ReactNode };

export default function FormPageHeader({ title, description, onBack, backLabel = 'Volver', status }: FormPageHeaderProps) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  return <Flex as="header" align={{ base: 'flex-start', md: 'center' }} justify="space-between" direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
    <Flex align="flex-start" gap={3}><Button aria-label={backLabel} variant="ghost" onClick={onBack} leftIcon={<MdArrowBack />}>{backLabel}</Button><Flex direction="column"><Heading as="h1" size="lg">{title}</Heading>{description && <Text color={muted}>{description}</Text>}</Flex></Flex>
    {status}
  </Flex>;
}
