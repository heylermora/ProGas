import React from 'react';
import { Box, Container, Stack, Text, Heading, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';

type PublicPageProps = {
  title?: string;
  description?: string;
  maxW?: string;
  children: React.ReactNode;
};

export function PublicPage({ title, description, maxW = '1200px', children }: PublicPageProps) {
  const bg = useColorModeValue('gray.50', 'navy.900');

  return (
    <Box bg={bg} minH="100vh" py="32px">
      <Container maxW={maxW}>
        {(title || description) && (
          <Stack spacing="10px" mb="28px">
            {title && <Heading>{title}</Heading>}
            {description && <Text color="gray.600">{description}</Text>}
          </Stack>
        )}
        {children}
      </Container>
    </Box>
  );
}

export function PublicCard({ children }: { children: React.ReactNode }) {
  return (
    <Card p="24px" borderRadius="24px" boxShadow="md" mb="40px">
      {children}
    </Card>
  );
}
