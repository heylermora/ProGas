import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  const muted = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  return (
    <Flex
      as="header"
      justify="space-between"
      align={{ base: 'flex-start', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap={4}
      mb={6}
    >
      <Box>
        <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800">{title}</Heading>
        {description && <Text color={muted}>{description}</Text>}
      </Box>
      {action && <Box flexShrink={0} w={{ base: '100%', sm: 'auto' }}>{action}</Box>}
    </Flex>
  );
}
