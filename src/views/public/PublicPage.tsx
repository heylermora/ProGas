import React from 'react';
import { Box, Container, Stack, Text, Heading, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';

type PublicPageProps = {
  title?: string;
  description?: string;
  maxW?: string;
  onBack?: () => void;
  backLabel?: string;
  embedded?: boolean;
  children: React.ReactNode;
};

export function PublicPage({ title, description, maxW = '1200px', onBack, backLabel, embedded, children }: PublicPageProps) {
  const bg = useColorModeValue('gray.50', 'navy.900');

  return (
    <Box bg={bg} minH={embedded ? undefined : "100vh"} py={{ base: '20px', md: '32px' }}>
      <Container maxW={maxW} px={{ base: '16px', sm: '20px', lg: '24px' }}>
        {(!embedded || onBack) && <PublicHeader onBack={onBack} backLabel={backLabel} />}
        {(title || description) && (
          <Stack spacing={{ base: '8px', md: '10px' }} mb={{ base: '20px', md: '28px' }}>
            {title && <Heading fontSize={{ base: '28px', md: '36px' }}>{title}</Heading>}
            {description && <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>{description}</Text>}
          </Stack>
        )}
        {children}
        {!embedded && <PublicFooter />}
      </Container>
    </Box>
  );
}

export function PublicCard({ children }: { children: React.ReactNode }) {
  return (
    <Card p={{ base: '16px', md: '24px' }} borderRadius={{ base: '18px', md: '24px' }} boxShadow="md" mb={{ base: '28px', md: '40px' }} overflow="hidden">
      {children}
    </Card>
  );
}
